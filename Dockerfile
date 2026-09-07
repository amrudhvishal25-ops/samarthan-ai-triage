# Standalone WhatsApp bot worker — scripts/whatsapp-bot.mjs only.
# The Next.js app is NOT built here; it deploys separately on Vercel.
FROM node:22-slim

# Baileys/qrcode need nothing native; tar is used for the optional
# WHATSAPP_SESSION_BUNDLE_BASE64 restore path.
RUN apt-get update && apt-get install -y --no-install-recommends tar ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install prod deps only (skips next, tailwind, typescript, @types/*)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Only what the bot actually needs at runtime
COPY scripts/ ./scripts/

ENV NODE_ENV=production
# Fly injects PORT; the bot's HTTP server (/health + QR page) binds to it.
EXPOSE 8080

CMD ["node", "scripts/whatsapp-bot.mjs"]
