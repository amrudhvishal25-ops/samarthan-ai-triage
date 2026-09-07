# Deploy the WhatsApp bot to Railway

The bot (`scripts/whatsapp-bot.mjs`) runs as its own always-on Railway
service. It links a WhatsApp account via Baileys, forwards every inbound
message to the Vercel `/api/whatsapp` triage endpoint, and publishes its
status + QR code to the `bot_state` row in Neon Postgres so the website
can show connection state.

## One-time setup

### 1. Create the service
- railway.com → **New Project** → **Deploy from GitHub repo** → pick this repo.
- Railway reads `railway.json`: it installs deps (no Next build) and starts
  `node scripts/whatsapp-bot.mjs`.

### 2. Environment variables (service → Variables)
| Key | Value |
|---|---|
| `DATABASE_URL` | same Neon pooled URL as Vercel (`postgresql://…-pooler.…/neondb?sslmode=require`) |
| `OPENAI_API_KEY` | same key as Vercel — used for local Whisper transcription of voice notes |
| `NEXT_PUBLIC_APP_URL` | `https://samarthan-ai.vercel.app` (no trailing slash) — where the bot POSTs triage calls |

`PORT` is injected by Railway automatically — don't set it.

### 3. Persistent volume (keeps WhatsApp linked across redeploys)
- Service → **Settings** → **Volumes** → **New Volume**
- Mount path: **`/app/.whatsapp_auth`**
- Size: 1 GB is plenty.

Without the volume the session is wiped on every redeploy and you have to
re-scan the QR each time.

### 4. Run the DB migration once (adds `bot_state`)
Already run against prod on 2026-09-07. If you rebuild the DB:
```
DATABASE_URL='<neon url>' node scripts/migrate.mjs
```

## Linking WhatsApp (first deploy)

1. Deploy. Wait for the service to be healthy.
2. Service → **Settings** → **Networking** → **Generate Domain**.
3. Open `https://<that-domain>/` in a browser — it auto-refreshes and shows
   the QR once Baileys emits one (usually within ~15 s of boot).
4. WhatsApp on the phone → **Linked devices** → **Link a device** → scan.
5. Page flips to **✅ Connected · +91…**. The `bot_state` row updates and
   `samarthan-ai.vercel.app` now reflects the live status.

You can also scan the ASCII QR straight from the Railway **deploy logs**.

## Re-linking later
Restart the service (or `railway redeploy`). If the volume is mounted it
reconnects with the saved session. To force a fresh QR, clear the volume
(Settings → Volumes → the volume → wipe) and redeploy.

## Health
- `GET /health` → `{"ok":true,"status":"CONNECTED"}` — Railway healthcheck.
- `GET /` → human status / QR page.
- Neon: `select status, user_phone, updated_at from bot_state;`

## Cost
One Railway service + a 1 GB volume sits comfortably in the Hobby plan's
monthly credit. The bot is light — a long-lived socket plus occasional
OpenAI calls.
