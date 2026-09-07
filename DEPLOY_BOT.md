# Deploy the WhatsApp bot (Fly.io — free tier)

The bot (`scripts/whatsapp-bot.mjs`) runs as one always-on Fly machine.
It links a WhatsApp account (Baileys), forwards every inbound message to
the Vercel `/api/whatsapp` triage endpoint, and publishes its status + QR
to the `bot_state` row in Neon Postgres so the website shows live state.

Fly's free allowance covers a `shared-cpu-1x` / 256 MB machine plus a
small volume. A card is required on the account but nothing is charged
within the allowance.

## One-time setup

### 1. Install flyctl + log in
```
brew install flyctl        # or: curl -L https://fly.io/install.sh | sh
fly auth signup            # or  fly auth login
```

### 2. Create the app (don't deploy yet)
```
cd "open ai hackaton"
fly launch --no-deploy --copy-config --name samarthan-whatsapp-bot
```
- It reads `fly.toml` + `Dockerfile`.
- Pick a region (default `sin` = Singapore, closest to India).
- Say **no** to Postgres/Redis add-ons.

### 3. Persistent volume (keeps WhatsApp linked across deploys)
```
fly volume create wa_auth --size 1 --region sin
```
Region must match `primary_region` in fly.toml. `fly.toml` already mounts
it at `/app/.whatsapp_auth`.

### 4. Secrets
```
fly secrets set \
  DATABASE_URL='<same Neon pooled URL as Vercel>' \
  OPENAI_API_KEY='<same key as Vercel>' \
  NEXT_PUBLIC_APP_URL='https://samarthan-ai.vercel.app'
```
`PORT` comes from `fly.toml` (`8080`) — don't set it as a secret.

### 5. Deploy
```
fly deploy
```

### 6. DB migration (adds `bot_state`) — run once
Already applied to prod on 2026-09-07. If you rebuild the DB:
```
DATABASE_URL='<neon url>' node scripts/migrate.mjs
```

## Linking WhatsApp (first deploy)

1. `fly deploy` finishes → machine boots.
2. Open the app URL: `https://samarthan-whatsapp-bot.fly.dev/`
   It auto-refreshes and shows the QR ~15 s after boot.
3. Phone → WhatsApp → **Linked devices** → **Link a device** → scan.
4. Page flips to **✅ Connected · +91…**. `bot_state` updates and
   `samarthan-ai.vercel.app` reflects the live status.

Or scan the ASCII QR from `fly logs`.

## Day-to-day

| Task | Command |
|---|---|
| Logs | `fly logs` |
| Restart | `fly apps restart samarthan-whatsapp-bot` |
| Status | `fly status` |
| Health | `curl https://samarthan-whatsapp-bot.fly.dev/health` |
| Re-link (fresh QR) | `fly volume destroy wa_auth` → recreate → `fly deploy` |
| DB check | `select status, user_phone, updated_at from bot_state;` |

With the volume mounted, a restart reconnects using the saved session —
no re-scan.

## Cost

One `shared-cpu-1x` 256 MB machine + a 1 GB volume sits inside Fly's free
allowance. The bot is light: a long-lived socket plus occasional OpenAI
calls for voice-note transcription.

---

### (Old) Railway notes
Railway removed its free tier — Hobby is $5/mo. `railway.json` +
`nixpacks.toml` are kept in the repo in case you switch back, but Fly is
the free path.
