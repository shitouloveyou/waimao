import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createHmac } from 'node:crypto';
import net from 'node:net';

// All requests target an isolated local server. No real customer records or email delivery.
test('production security boundaries and public product routes', { timeout: 60000 }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'edgevora-security-'));
  const port = await new Promise(resolve => { const server = net.createServer(); server.listen(0, '127.0.0.1', () => { const value = server.address().port; server.close(() => resolve(value)); }); });
  const origin = 'https://edgevoratools.com';
  const base = `http://127.0.0.1:${port}`;
  const secret = 'test-only-session-secret-not-a-production-credential';
  const expires = String(Date.now() + 600000);
  const cookie = `fn_admin=${expires}.${createHmac('sha256', secret).update(expires).digest('hex')}`;
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X6foAAAAASUVORK5CYII=', 'base64');
  const oldFile = '11111111-1111-1111-1111-111111111111.png';
  const products = ['kitchen-shears', 'tailor-scissors', 'pruning-shears', 'electrician-scissors'].map(id => ({ id, name: `SK5 ${id}`, category: 'Garden Tools', material: 'SK5 Steel', description: 'Pruning shears', price: 'Request quote', moq: 'To be confirmed', status: 'Request Quote', image: '/test.png', active: true }));
  const settings = { companyName: 'Edgevora Tools', email: 'sales@example.invalid', whatsapp: '', wechat: '', about: '', heroImages: [] };
  await mkdir(path.join(directory, 'uploads'));
  await writeFile(path.join(directory, 'uploads', oldFile), png);
  await writeFile(path.join(directory, 'store.json'), JSON.stringify({ products, settings, orders: [{ id: 'test-order' }], inquiries: [{ id: 'legacy', name: '=1+1', message: 'test', attachmentUrl: `/api/uploads/${oldFile}` }] }));
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { stdio: 'ignore', env: { ...process.env, NODE_ENV: 'production', DATA_DIR: directory, SITE_URL: origin, ADMIN_PASSWORD: 'test-only-password', SESSION_SECRET: secret, BREVO_API_KEY: '', RESEND_API_KEY: '', NOTIFY_EMAIL: '' } });
  const request = (url, options = {}) => fetch(base + url, { redirect: 'manual', ...options });
  const admin = { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' };
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      try { if ((await request('/')).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'local production server started');
    for (const endpoint of ['/api/admin/backup', '/api/admin/inquiries/export']) assert.equal((await request(endpoint)).status, 401);
    for (const [endpoint, method] of [['products','PUT'],['settings','PUT'],['orders','POST'],['inquiries','PATCH'],['upload','POST']]) {
      const response = await request(`/api/admin/${endpoint}`, { method, headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(response.status, 401, `anonymous ${endpoint}`);
    }
    const crossSite = await request('/api/admin/products', { method: 'PUT', headers: { ...admin, Origin: 'https://untrusted.invalid' }, body: '[]' });
    assert.equal(crossSite.status, 403);
    assert.equal((await request('/api/admin/logout', { method: 'POST', headers: { Cookie: cookie } })).status, 403);
    const malformedCookie = `fn_admin=${expires}.${'z'.repeat(64)}`;
    assert.equal((await request('/api/admin/backup', { headers: { Cookie: malformedCookie } })).status, 401);
    assert.equal((await request('/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' })).status, 400);
    const login = await request('/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'test-only-password' }) });
    assert.equal(login.status, 200);
    assert.match(login.headers.get('set-cookie'), /HttpOnly/i);
    assert.match(login.headers.get('set-cookie'), /Secure/i);
    assert.match(login.headers.get('set-cookie'), /SameSite=lax/i);
    const backup = await request('/api/admin/backup', { headers: { Cookie: cookie } });
    assert.match(backup.headers.get('cache-control'), /no-store/);
    assert.equal((await backup.json()).orders[0].id, 'test-order');
    const csv = await request('/api/admin/inquiries/export', { headers: { Cookie: cookie } });
    assert.match(await csv.text(), /"'=1\+1"/);
    assert.equal((await request(`/api/uploads/${oldFile}`)).status, 401);
    const legacy = await request(`/api/uploads/${oldFile}`, { headers: { Cookie: cookie } });
    assert.equal(legacy.status, 200);
    assert.match(legacy.headers.get('cache-control'), /no-store/);
    for (const badType of ['image/png', 'application/pdf']) {
      const form = new FormData();
      form.set('name', 'Test'); form.set('email', 'test@example.invalid'); form.set('message', 'Local test only');
      form.set('attachment', new File(['<script>not a genuine file</script>'], 'fake', { type: badType }));
      assert.equal((await request('/api/inquiries', { method: 'POST', headers: { Origin: origin }, body: form })).status, 400);
    }
    const form = new FormData();
    form.set('name', 'Local Test'); form.set('email', 'test@example.invalid'); form.set('message', 'Local fixture inquiry, no email is sent.');
    form.set('attachment', new File([png], 'reference.png', { type: 'image/png' }));
    assert.equal((await request('/api/inquiries', { method: 'POST', headers: { Origin: origin }, body: form })).status, 200);
    const productUpload = new FormData();
    productUpload.set('file', new File([png], 'product.png', { type: 'image/png' }));
    const publicAsset = await request('/api/admin/upload', { method: 'POST', headers: { Origin: origin, Cookie: cookie }, body: productUpload });
    assert.equal(publicAsset.status, 200);
    const publicUrl = (await publicAsset.json()).url;
    assert.equal((await request(publicUrl)).status, 200, 'product photos remain public');
    const data = JSON.parse(await readFile(path.join(directory, 'store.json'), 'utf8'));
    const attachment = data.inquiries[0].attachmentUrl;
    assert.match(attachment, /^\/api\/attachments\//);
    assert.equal((await request(attachment)).status, 401);
    const authorizedFile = await request(attachment, { headers: { Cookie: cookie } });
    assert.equal(authorizedFile.status, 200);
    assert.match(authorizedFile.headers.get('cache-control'), /no-store/);
    const oversized = await request('/api/events', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'view', visitor: 'x', page: 'x'.repeat(9000) }) });
    assert.equal(oversized.status, 413);
    const streamed = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(5000)); controller.enqueue(new Uint8Array(5000)); controller.close(); } });
    const chunked = await request('/api/events', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: streamed, duplex: 'half' });
    assert.equal(chunked.status, 413, 'size limit also applies without Content-Length');
    assert.equal((await request('/api/events', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'Content-Encoding': 'br' }, body: '{}' })).status, 415);
    assert.equal((await request('/api/admin/products', { method: 'PUT', headers: admin, body: '[null]' })).status, 400);
    assert.equal((await request('/api/admin/products', { method: 'PUT', headers: admin, body: JSON.stringify(products) })).status, 200);
    for (const [old, slug] of [['kitchen-shears','sk5-pruning-shears-red-silver'],['tailor-scissors','sk5-pruning-shears-safety-lock'],['electrician-scissors','sk5-pruning-shears-gray-red']]) {
      const redirect = await request(`/products/${old}?utm_source=test&tag=a&tag=b`);
      assert.equal(redirect.status, 308);
      assert.equal(redirect.headers.get('location'), `/products/${slug}?utm_source=test&tag=a&tag=b`);
      assert.equal((await request(`/products/${slug}`)).status, 200);
    }
    const home = await (await request('/?product=test')).text();
    assert.match(home, /rel="canonical" href="https:\/\/edgevoratools.com\/?"/);
    assert.match(home, /Wholesale SK5 Pruning Shears \| Edgevora Tools/);
    assert.equal((await request('/products/nonexistent')).status, 404);
    let throttled;
    for (let i = 0; i < 6; i++) throttled = await request('/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'wrong-test-password' }) });
    assert.equal(throttled.status, 429);
    assert.ok(Number(throttled.headers.get('retry-after')) > 0);
  } finally {
    server.kill();
    await new Promise(resolve => server.once('exit', resolve));
    await rm(directory, { recursive: true, force: true });
  }
});
