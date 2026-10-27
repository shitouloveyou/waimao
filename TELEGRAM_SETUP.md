# Telegram notifications (optional)

First version: new inquiry notifications and a daily report, without an additional always-running process or third-party packages. No Telegram command handler, webhook, reboot or server-control functions are installed. The website remains usable if Telegram is disabled or unreachable. Existing email notifications continue independently.

## 1. Create and connect a private bot

Open the official https://t.me/BotFather in Telegram, send `/newbot`, and follow its prompts. Keep the token private. Open your new bot and send `/start` from your own account. Do not add it to groups or publish its username before setup.

On the **website server** (`ubuntu@VM-0-13-ubuntu`, not the Alibaba VPN servers), edit `/etc/edgevora.env` with sudo and add:

```dotenv
TELEGRAM_BOT_TOKEN=your_private_token
TELEGRAM_CHAT_ID=your_own_numeric_private_chat_id
```

Do not commit these values, paste them into screenshots, or put tokens in browser URLs. Existing settings in this file must be retained. `SITE_URL=https://edgevoratools.com` and `DATA_DIR=/srv/edgevora/data` should already be set. These are server-only variables; do not prefix them with NEXT_PUBLIC_.

To discover the chat ID, add the token first and temporarily leave TELEGRAM_CHAT_ID unset, then run:

```sh
sudo systemd-run --quiet --wait --pipe --collect -p User=ubuntu -p WorkingDirectory=/srv/edgevora/app -p EnvironmentFile=/etc/edgevora.env /usr/bin/node /srv/edgevora/app/scripts/telegram.mjs chat-id
```

This prints only a numeric private `/start` sender ID, not message contents or tokens. Stop if there is more than one candidate. Verify the ID is your own account (for example compare a `/start` sent just now, before sharing the bot) before adding it to the env file. Only the configured positive private chat ID is used for sending; group IDs are rejected. This first version does not read or execute chat commands.

Test explicitly after configuring both fields:

```sh
sudo systemd-run --quiet --wait --pipe --collect -p User=ubuntu -p WorkingDirectory=/srv/edgevora/app -p EnvironmentFile=/etc/edgevora.env /usr/bin/node /srv/edgevora/app/scripts/telegram.mjs test
```

Restart `edgevora` to load the new variables. Submit one authorized test inquiry and confirm the inquiry appears in the backend, existing email arrives, and Telegram receives a short alert. Alerts omit customer names/contact details, message text and attachment URLs. They include the product field (which is customer supplied), time, attachment count and a link to the authenticated admin. No API token is stored in the database or displayed publicly.

## 2. Daily report

Verify the `ubuntu` account can read `/srv/edgevora/data/store.json` and events.jsonl and write to `/srv/edgevora/data` before enabling the supplied service. If your deployment uses a different account/data location, adapt the unit to that existing account/location; do not loosen directory permissions to everyone.

Install supplied units one command at a time:

```sh
sudo cp deploy/edgevora-telegram-daily.service /etc/systemd/system/
```

```sh
sudo cp deploy/edgevora-telegram-daily.timer /etc/systemd/system/
```

```sh
sudo systemctl daemon-reload
```

```sh
sudo systemctl enable --now edgevora-telegram-daily.timer
```

```sh
systemctl list-timers edgevora-telegram-daily.timer --no-pager
```

The timer sends the **previous complete day's** summary at **09:00 Asia/Shanghai**, even if the server timezone is UTC. After downtime, Persistent=true sends the last complete day rather than replaying every missed day. Zero-activity reports are sent too. It measures the website's own page views, product clicks, saved inquiries, WhatsApp clicks; this is not GA unique users, excludes no bots, and WhatsApp clicks are not completed conversations.

The event log is streamed, not loaded in full. The existing store.json is read to count saved inquiries accurately. A small private marker under DATA_DIR prevents another normal send for the same day. Telegram acceptance followed by a crash before the marker write can still cause a duplicate; a timeout can mean uncertain delivery. There is no automatic retry loop. Failed delivery never deletes inquiries or marks them viewed. The notification request has an 8-second timeout; it runs concurrently with email and can add latency to an inquiry submission. Sending failures are logged without tokens and do not change a saved inquiry's successful response.

Check failures with `sudo journalctl -u edgevora-telegram-daily.service -n 20 --no-pager` or website service logs. The site server must reach api.telegram.org over HTTPS; VPN connectivity on your phone does not establish server connectivity. If unreachable, keep email and troubleshoot separately.

## Disable

Remove both TELEGRAM_* variables and restart edgevora to stop new inquiry alerts. Run `sudo systemctl disable --now edgevora-telegram-daily.timer` to stop reports. Do not delete the existing website env file.

## Local verification (no live messages)

`node --test tests/telegram.test.mjs` uses a fake transport and temporary data. Run the production build and existing security tests after code changes. Do not use real production credentials for local tests.

Official API reference: https://core.telegram.org/bots/api
