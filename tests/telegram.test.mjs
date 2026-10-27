import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { telegramConfig, sendTelegram, inquiryTelegramText, shanghaiDate } from '../lib/telegram.mjs';
import { countDay } from '../scripts/telegram.mjs';
const env = { TELEGRAM_BOT_TOKEN: '12345:abcdefghijklmnopqrstuvwxyz', TELEGRAM_CHAT_ID: '123456', SITE_URL: 'https://edgevoratools.com' };
test('disabled configuration does not send; groups and partial configuration are rejected', async () => {
  assert.equal(telegramConfig({}), null);
  assert.equal(await sendTelegram('test', {}, () => { throw new Error('Must not send'); }), false);
  assert.throws(() => telegramConfig({ ...env, TELEGRAM_CHAT_ID: '-12345' }));
  assert.throws(() => telegramConfig({ TELEGRAM_BOT_TOKEN: env.TELEGRAM_BOT_TOKEN }));
});
test('sends only to configured private chat, plain text and secure admin link', async () => {
  const inquiry = { product: '<b>Shears</b>', createdAt: '2026-10-26T17:00:00Z', attachmentUrl: '/private.png', email: 'secret@example.com', message: 'private message' };
  const text = inquiryTelegramText(inquiry);
  assert.ok(!text.includes(inquiry.email)); assert.ok(!text.includes(inquiry.message)); assert.ok(!text.includes(inquiry.attachmentUrl));
  let calls = 0;
  assert.equal(await sendTelegram(text, env, async (url, options) => {
    calls++;
    const body = JSON.parse(options.body);
    assert.equal(body.chat_id, '123456'); assert.equal(body.parse_mode, undefined);
    assert.equal(body.reply_markup.inline_keyboard[0][0].url, 'https://edgevoratools.com/admin');
    return { ok: true, status: 200, json: async () => ({ ok: true, result: {} }) };
  }), true);
  assert.equal(calls, 1);
});
test('transport errors do not leak token in error text', async () => {
  await assert.rejects(sendTelegram('x', env, async url => { throw new Error(url); }), error => !error.message.includes(env.TELEGRAM_BOT_TOKEN));
  await assert.rejects(sendTelegram('x', env, async () => ({ ok: true, status: 200, json: async () => ({ ok: false }) })));
});
test('Shanghai midnight boundaries, malformed lines, saved inquiries and absent log', async () => {
  assert.equal(shanghaiDate(new Date('2026-10-26T16:00:00Z')), '2026-10-27');
  const dir = await mkdtemp(path.join(os.tmpdir(), 'edgevora-telegram-'));
  try {
    await writeFile(path.join(dir, 'store.json'), JSON.stringify({ inquiries: [{ createdAt: '2026-10-26T15:59:59Z' }, { createdAt: '2026-10-26T16:00:00Z' }] }));
    assert.deepEqual(await countDay(dir, '2026-10-26'), { views: 0, products: 0, inquiries: 1, whatsapp: 0 });
    await writeFile(path.join(dir, 'events.jsonl'), ['not json', ...['view', 'product_click', 'whatsapp', 'inquiry'].map(type => JSON.stringify({ type, createdAt: '2026-10-26T15:59:59Z' })), JSON.stringify({ type: 'view', createdAt: '2026-10-26T16:00:00Z' })].join('\n'));
    assert.deepEqual(await countDay(dir, '2026-10-26'), { views: 1, products: 1, inquiries: 1, whatsapp: 1 });
  } finally { await rm(dir, { recursive: true, force: true }); }
});
