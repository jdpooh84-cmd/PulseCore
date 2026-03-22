# PulseCore v6.0 — AI Marketing Engine

> Scout your community. Write a video script. Publish everywhere.
> Built for local business owners. Powered by AI.

---

## What PulseCore Does

PulseCore is a 7-step AI marketing workflow:

1. **Connect** — Enter your Anthropic API key
2. **Profile** — Describe your business in plain English
3. **Scout** — AI searches live local news and events in your city
4. **Audit** — See content opportunities your competitors are missing
5. **Platforms** — Choose where you publish (Instagram, TikTok, etc.)
6. **Script** — Get a 22-second HeyGen talking-video script built from real local facts
7. **Publish** — Copy your captions, open your platforms, post

---

## File Structure

```
PulseCore/
├── server/
│   └── index.js          ← Express server + Claude API proxy
├── public/
│   ├── index.html        ← Full web app (single file)
│   ├── manifest.json     ← PWA manifest
│   ├── sw.js             ← Service worker
│   ├── icon-192.png      ← App icon (add your own)
│   └── icon-512.png      ← App icon (add your own)
├── .env.example          ← Template — copy to .env and fill in key
├── .env                  ← Your secrets (DO NOT commit to git)
├── package.json
├── Procfile              ← Render.com deployment
└── START.bat             ← Windows launcher (double-click to run)
```

---

## Local Setup (Windows)

1. Download all files into a folder called `PulseCore`
2. Copy `.env.example` → `.env`
3. Open `.env` in Notepad, replace `PASTE_YOUR_KEY_HERE` with your key from [console.anthropic.com](https://console.anthropic.com)
4. Double-click `START.bat`
5. Chrome opens at `http://localhost:3000`

**First time only:** `START.bat` runs `npm install` automatically.

---

## Sharing the App

### Option A — Share your local URL (same network)
Find your local IP (`ipconfig` on Windows) and share:
`http://192.168.1.XX:3000`

Anyone on your WiFi can open it.

### Option B — Deploy to Render.com (shareable link, anyone, anywhere)

1. Push the `PulseCore` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service → connect your repo
3. Build command: `npm install`
4. Start command: `node server/index.js`
5. Add environment variable: `ANTHROPIC_API_KEY` = your key
6. Deploy → get a shareable link like `https://pulsecore-xyz.onrender.com`

Share that link with any business owner. They open it, enter nothing — the server holds the API key.

> **Note:** On Render's free tier, the server sleeps after 15 minutes of inactivity. First load after sleep takes ~30 seconds.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | From console.anthropic.com |
| `PORT` | No | Default: 3000 |
| `APP_URL` | No | Your full URL (for Render: `https://your-app.onrender.com`) |
| `ALLOWED_ORIGIN` | No | CORS origin. Default: `*` (open) |

---

## Future Android / iOS Packaging

PulseCore is structured for future store wrapping with:

**Capacitor (recommended):**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init PulseCore com.yourname.pulsecore
npx cap add android
npx cap add ios
npx cap sync
```

**Requirements before store submission:**
- Replace placeholder icons with real 192×192 and 512×512 PNG icons
- Update `manifest.json` with real app name and branding
- Set `ALLOWED_ORIGIN` to your production URL
- Review Anthropic's usage policies for app store distribution
- Add in-app purchase or subscription if monetizing

**Store readiness checklist:**
- [x] Mobile-responsive CSS with safe-area insets
- [x] Touch-friendly tap targets (min 48px)
- [x] PWA manifest with icons
- [x] Service worker for offline shell
- [x] No use of deprecated WebView APIs
- [x] Single-file frontend (easy to wrap)
- [ ] Real app icons (add `icon-192.png` and `icon-512.png`)
- [ ] Privacy policy URL
- [ ] App store developer accounts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — single file |
| Backend | Node.js + Express |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Voice | Web Speech API (Chrome/Edge) |
| Web Search | Claude web_search_20250305 tool |
| Mentor AI | Google Gemini 2.0 Flash (user key) |
| PWA | Service Worker + manifest.json |
| Deployment | Render.com / any Node host |

---

## Ricky — Voice Assistant

Ricky is a dual-mode AI assistant embedded in every screen:

**Commands mode** — Voice shortcuts:
- "Hey Ricky, generate a new script"
- "Hey Ricky, read me the script"
- "Hey Ricky, go to publish"
- "Hey Ricky, what step am I on"
- "Hey Ricky, help"

**Talk to Ricky mode** — A mentoring conversation powered by Gemini:
- Business strategy questions
- Content planning
- Emotional support and encouragement
- Requires user to paste their own Gemini API key

---

## Version History

- **v6.0** — Production hardening, PWA, mobile bottom sheet, localStorage persistence, abort/timeout, clipboard fallback, inline validation, expanded server, full README
- **v5.2** — Lighthouse theme, Gemini mentor mode, Strategy Engine, greeting modal
- **v5.1** — Mic fix (getUserMedia preflight), restart guard, origin check

---

*PulseCore — Built for the people running the places we love.*
