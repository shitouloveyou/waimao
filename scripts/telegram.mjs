import { createReadStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import { createInterface } from 'node:readline';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { telegramConfig, telegramRequest, sendTelegram, shanghaiDate, digestText } from '../lib/telegram.mjs';

// Stream the event log: memory usage does not grow with its file size.
export async function countDay(directory, day) {
  const counts = { views: 0, products: 0, inquiries: 0, whatsapp: 0 };
  const keys = { view: 'views', product_click: 'products', whatsapp: 'whatsapp' };
  const filename = path.join(directory, 'events.jsonl');
  try { await fs.access(filename); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const stream = createReadStream(filename, { encoding: 'utf8' });
  try {
    for await (const line of createInterface({ input: stream, crlfDelay: Infinity })) {
      let event;
      try { event = JSON.parse(line); } catch { continue; }
      const date = new Date(event.createdAt);
      if (!Number.isFinite(date.getTime()) || shanghaiDate(date) !== day) continue;
      const key = Object.hasOwn(keys, event.type) ? keys[event.type] : null;
      if (key) counts[key]++;
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  finally { stream.destroy(); }
  // Saved inquiries are authoritative, even if recording an analytics event failed.
  const data = JSON.parse(await fs.readFile(path.join(directory, 'store.json'), 'utf8'));
  counts.inquiries = (data.inquiries || []).filter(item => {
    const date = new Date(item.createdAt);
    return Number.isFinite(date.getTime()) && shanghaiDate(date) === day;
  }).length;
  return counts;
}

async function main() {
  const command = process.argv[2];
  if (command === 'chat-id') {
    const token = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(token)) throw new Error('Set TELEGRAM_BOT_TOKEN first');
    const updates = await telegramRequest(token, 'getUpdates', { limit: 100, timeout: 0, allowed_updates: ['message'] });
    const candidates = [...new Set(updates.filter(item => item.message?.chat?.type === 'private' && /^\/start(?:\s|$)/.test(item.message.text || '')).map(item => String(item.message.chat.id)))];
    if (candidates.length !== 1) throw new Error('Need exactly one private /start sender. Confirm your own chat ID in Telegram before configuring; do not use a stranger’s ID.');
    console.log(`Private /start chat ID: ${candidates[0]}. Confirm this is your own Telegram account before using it.`);
    return;
  }
  if (!telegramConfig()) throw new Error('Telegram is not configured');
  if (command === 'test') {
    await sendTelegram('Edgevora Tools · 连接测试成功\n新询盘提醒与每日简报发送到此私聊。');
    console.log('Telegram test accepted');
    return;
  }
  if (command !== 'daily') throw new Error('Usage: node scripts/telegram.mjs chat-id|test|daily');
  const directory = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  // Daily report is for the last complete calendar day in China, never a partial day.
  const day = shanghaiDate(new Date(Date.now() - 86400000));
  const marker = path.join(directory, 'telegram-digest-sent.json');
  let previous;
  try { previous = JSON.parse(await fs.readFile(marker, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previous?.day === day) { console.log('Digest already sent'); return; }
  await sendTelegram(digestText(day, await countDay(directory, day)));
  const temp = `${marker}.${process.pid}.tmp`;
  await fs.writeFile(temp, JSON.stringify({ day }), { mode: 0o600 });
  await fs.rename(temp, marker);
  console.log('Telegram daily digest accepted');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Telegram command failed. Check configuration, private /start, network access and data directory. Token and customer data are omitted from logs.'); process.exitCode = 1; });
}
