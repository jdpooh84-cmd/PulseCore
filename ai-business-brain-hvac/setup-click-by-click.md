# AI Business Brain (HVAC) - Click-by-Click Setup for Beginners

Follow every step in this exact order. This is one complete working version.

Business profile in this setup:
- Offer name: **AI Business Brain**
- Niche: **Home Services (HVAC)**
- Sample company: **Coastal Comfort HVAC** (Chesapeake, Virginia)

---

## Step 1) Open the project folder

1. Open terminal.
2. Run:

```bash
cd /workspace/ai-business-brain-hvac
```

3. Confirm you see these files:
   - `lead-capture-form.html`
   - `lead-webhook-server.js`
   - `field-mapping.js`
   - `sample-lead-payload.json`
   - `airtable-column-mapping.md`
   - `templates/owner-alert-email.txt`
   - `templates/customer-auto-reply-email.txt`
   - `monthly-summary-output-format.md`

---

## Step 2) Create Airtable table exactly

1. Go to https://airtable.com and sign in.
2. Click **Create**.
3. Click **Start from scratch**.
4. Name base: `AI Business Brain - Coastal Comfort HVAC`.
5. Rename first table to: `Leads`.
6. Add columns exactly as shown in `airtable-column-mapping.md`.
7. Important: names must match exactly (including spaces and capitalization).

---

## Step 3) Create Airtable token and get Base ID

1. In Airtable, click your profile icon (top-right).
2. Click **Developer hub**.
3. Click **Personal access tokens**.
4. Click **Create token**.
5. Token name: `AI Business Brain HVAC`.
6. Add these scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
7. Under Base access, choose your base.
8. Click **Create token**.
9. Copy token and save it (this is `AIRTABLE_API_KEY`).
10. Open https://airtable.com/api
11. Click your base.
12. Copy Base ID from API page (starts with `app...`) and save it (`AIRTABLE_BASE_ID`).

---

## Step 4) Prepare Gmail for sending emails

1. Use a Gmail account for sending emails.
2. In Google account settings, turn on **2-Step Verification**.
3. Go to **Security -> App passwords**.
4. Create app password named: `AI Business Brain HVAC`.
5. Copy the 16-character app password and save it (`SMTP_PASS`).
6. Your Gmail address will be `SMTP_USER` and `FROM_EMAIL`.

---

## Step 5) Install dependencies

Run:

```bash
cd /workspace/ai-business-brain-hvac
npm install
```

---

## Step 6) Create your `.env` file

1. In `/workspace/ai-business-brain-hvac`, create a new file named `.env`.
2. Copy and paste this exact block.
3. Replace placeholder values with your real values.

```env
PORT=8787
WEBHOOK_PATH=/webhook/lead
REPORTS_PATH=/reports/monthly

# Airtable
AIRTABLE_API_KEY=PASTE_YOUR_AIRTABLE_TOKEN_HERE
AIRTABLE_BASE_ID=PASTE_YOUR_BASE_ID_HERE
AIRTABLE_TABLE_NAME=Leads

# Webhook protection (choose any long random text)
WEBHOOK_SECRET=change-this-to-a-long-random-secret

# Business info
BUSINESS_NAME=Coastal Comfort HVAC
BUSINESS_CITY=Chesapeake
BUSINESS_STATE=Virginia
BUSINESS_PHONE=(757) 555-0147
BUSINESS_OWNER_NAME=Coastal Comfort HVAC Team
OFFER_NAME=AI Business Brain
SERVICE_CATEGORY=HVAC

# Email addresses
OWNER_EMAIL=owner@coastalcomforthvac.com
FROM_EMAIL=yourname@gmail.com

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=yourname@gmail.com
SMTP_PASS=PASTE_YOUR_GMAIL_APP_PASSWORD
```

4. Save the file.

---

## Step 7) Start the webhook server

Run:

```bash
cd /workspace/ai-business-brain-hvac
npm start
```

You should see:
- `AI Business Brain HVAC webhook server running on http://localhost:8787`
- `Lead webhook endpoint: http://localhost:8787/webhook/lead`

Keep this terminal window open.

---

## Step 8) Connect the HTML form

1. Open file: `/workspace/ai-business-brain-hvac/form-handler.js`
2. Find:
   - `const webhookUrl = 'http://localhost:8787/webhook/lead';`
3. If needed, replace it with your real public URL (same path `/webhook/lead`).
4. Find:
   - `const webhookSecret = 'change-this-to-a-long-random-secret';`
5. Set it to exactly the same value as `WEBHOOK_SECRET` in `.env`.
6. Save file.

---

## Step 9) Submit a test lead

1. Open `/workspace/ai-business-brain-hvac/lead-capture-form.html` in your browser.
2. Fill out all fields.
3. Click **Send Request**.
4. Confirm success message appears.
5. Open Airtable `Leads` table and confirm a new row appears.
6. Check owner email inbox for owner alert.
7. Check customer email inbox for auto-reply.

If all 7 checks pass, your system is live.

---

## Step 10) Generate monthly summary

Run:

```bash
curl "http://localhost:8787/reports/monthly?month=2026-04"
```

- Replace `2026-04` with the month you want.
- Output format reference: `monthly-summary-output-format.md`

---

## Step 11) Files included in this working version

1. `lead-capture-form.html` - Lead capture form page
2. `lead-webhook-server.js` - Sample webhook handler + email send + monthly summary endpoint
3. `field-mapping.js` - Field mapping logic and validation
4. `sample-lead-payload.json` - Sample JSON payload
5. `airtable-column-mapping.md` - Airtable column mapping
6. `templates/owner-alert-email.txt` and `templates/customer-auto-reply-email.txt` - Email template files
7. `monthly-summary-output-format.md` - Monthly report output format
8. This file `setup-click-by-click.md` - Exact beginner setup instructions
