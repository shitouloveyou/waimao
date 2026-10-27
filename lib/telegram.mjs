/** No customer contact details or attachment contents are sent to Telegram. */
export function telegramConfig(env = process.env) {
  const token = env.TELEGRAM_BOT_TOKEN || '';
  const chatId = env.TELEGRAM_CHAT_ID || '';
  if (!token && !chatId) return null;
  if (!/^\d+:[A-Za-z0-9_-]{20,}$/.test(token) || !/^[1-9]\d{0,15}$/.test(chatId)) throw new Error('Telegram configuration invalid');
  return { token, chatId };
}

export async function telegramRequest(token, method, body, fetcher = fetch) {
  let response;
  try {
    response = await fetcher(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(8000), redirect: 'error',
    });
  } catch { throw new Error('Telegram network request failed'); }
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.ok !== true) throw new Error(`Telegram request rejected (HTTP ${response.status})`);
  return data.result;
}

export function adminUrl(env = process.env) {
  const url = new URL(env.SITE_URL || 'https://edgevoratools.com');
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Telegram admin URL must use HTTPS');
  return new URL('/admin', url.origin).href;
}

export async function sendTelegram(text, env = process.env, fetcher = fetch) {
  const config = telegramConfig(env);
  if (!config) return false;
  await telegramRequest(config.token, 'sendMessage', {
    chat_id: config.chatId, text: text.slice(0, 4000),
    link_preview_options: { is_disabled: true },
    reply_markup: { inline_keyboard: [[{ text: '打开网站后台', url: adminUrl(env) }]] },
  }, fetcher);
  return true;
}

/** @param {{product?: string, attachmentUrl?: string, createdAt: string}} inquiry */
export function inquiryTelegramText(inquiry) {
  const product = String(inquiry.product || '未指定产品').replace(/[\r\n\u0000-\u001f]/g, ' ').slice(0, 200);
  return `Edgevora Tools · 新询盘\n产品：${product}\n时间：${new Date(inquiry.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}（北京时间）\n附件：${inquiry.attachmentUrl ? '1 个' : '无'}\n请到后台查看客户资料和需求。`;
}

export function shanghaiDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function digestText(day, counts) {
  return `Edgevora Tools · 每日简报\n日期：${day}（北京时间）\n页面浏览：${counts.views}\n产品点击：${counts.products}\n新增询盘：${counts.inquiries}\nWhatsApp 点击：${counts.whatsapp}\n\n来源：网站自身统计，可能包含自己访问和机器人；不等同于 GA 用户数。WhatsApp 点击不代表已发送消息。`;
}
