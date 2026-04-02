'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const {
  mapLeadPayloadToAirtableFields,
  validateLeadPayload
} = require('./field-mapping');
const {
  createLeadRecord,
  updateLeadRecord,
  listLeadRecordsForMonth
} = require('./airtable-client');
const {
  ownerAlertContent,
  customerAutoReplyContent
} = require('./email-templates');

const app = express();
const PORT = process.env.PORT || 3010;
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || '/webhook/lead';
const REPORTS_PATH = process.env.REPORTS_PATH || '/reports/monthly';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function createMailer() {
  const smtpHost = requiredEnv('SMTP_HOST');
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpSecure = process.env.SMTP_SECURE === 'true';
  const smtpUser = requiredEnv('SMTP_USER');
  const smtpPass = requiredEnv('SMTP_PASS');

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass }
  });
}

const mailer = createMailer();

function normalizeStatus(statusValue) {
  const value = String(statusValue || '').trim().toLowerCase();
  if (value === 'contacted') return 'Contacted';
  if (value === 'won') return 'Won';
  if (value === 'lost') return 'Lost';
  return 'New';
}

async function sendOwnerAlert(fields) {
  const ownerTo = requiredEnv('OWNER_ALERT_EMAIL');
  const fromEmail = requiredEnv('SMTP_FROM_EMAIL');
  const fromName = process.env.SMTP_FROM_NAME || 'AI Business Brain';
  const subject = `New HVAC Lead: ${fields['Full Name']} (${fields['Service Needed']})`;
  const text = ownerAlertContent(fields);
  await mailer.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: ownerTo,
    subject,
    text
  });
}

async function sendCustomerAutoReply(fields) {
  const fromEmail = requiredEnv('SMTP_FROM_EMAIL');
  const fromName = process.env.SMTP_FROM_NAME || 'AI Business Brain';
  const subject = `Thanks for contacting ${fields['Business Name']} - we got your request`;
  const text = customerAutoReplyContent(fields);
  await mailer.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: fields.Email,
    subject,
    text
  });
}

function monthKeyOrCurrent(value) {
  if (value && /^\d{4}-\d{2}$/.test(value)) return value;
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function summarizeMonthly(records, month) {
  const urgencyCounts = {};
  const serviceCounts = {};
  const sourceCounts = {};
  const totals = {
    total_leads: 0,
    new_leads: 0,
    contacted_leads: 0,
    won_leads: 0,
    lost_leads: 0,
    owner_alert_sent_count: 0,
    customer_auto_reply_sent_count: 0
  };

  const normalizedRows = records
    .map((record) => record.fields || {})
    .sort((a, b) => {
      const ad = new Date(a['Created At'] || 0).getTime();
      const bd = new Date(b['Created At'] || 0).getTime();
      return bd - ad;
    });

  for (const f of normalizedRows) {
    const urgency = f.Urgency || 'Unknown';
    const service = f['Service Needed'] || 'Unknown';
    const source = f['Source Page'] || 'Unknown';
    const status = normalizeStatus(f.Status);
    const ownerAlertSent = String(f['Owner Alert Sent'] || '').toLowerCase() === 'yes';
    const customerReplySent = String(f['Customer Auto-Reply Sent'] || '').toLowerCase() === 'yes';

    urgencyCounts[urgency] = (urgencyCounts[urgency] || 0) + 1;
    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    totals.total_leads += 1;
    if (status === 'New') totals.new_leads += 1;
    if (status === 'Contacted') totals.contacted_leads += 1;
    if (status === 'Won') totals.won_leads += 1;
    if (status === 'Lost') totals.lost_leads += 1;
    if (ownerAlertSent) totals.owner_alert_sent_count += 1;
    if (customerReplySent) totals.customer_auto_reply_sent_count += 1;
  }

  const top5 = normalizedRows.slice(0, 5).map((f) => ({
    created_at: f['Created At'] || '',
    full_name: f['Full Name'] || '',
    email: f.Email || '',
    phone: f.Phone || '',
    service_needed: f['Service Needed'] || '',
    urgency: f.Urgency || '',
    status: normalizeStatus(f.Status)
  }));

  return {
    report_month: month,
    business_name: process.env.BUSINESS_NAME || 'Coastal Comfort HVAC',
    business_city: process.env.BUSINESS_CITY || 'Chesapeake',
    business_state: process.env.BUSINESS_STATE || 'Virginia',
    offer_name: process.env.OFFER_NAME || 'AI Business Brain',
    service_category: process.env.SERVICE_CATEGORY || 'HVAC',
    totals,
    urgency_breakdown: urgencyCounts,
    service_needed_breakdown: serviceCounts,
    lead_source_breakdown: sourceCounts,
    top_5_recent_leads: top5,
    generated_at: new Date().toISOString()
  };
}

app.post(WEBHOOK_PATH, async (req, res) => {
  try {
    if (WEBHOOK_SECRET) {
      const incoming = String(req.headers['x-webhook-secret'] || '');
      if (incoming !== WEBHOOK_SECRET) {
        return res.status(401).json({
          ok: false,
          message: 'Unauthorized webhook request'
        });
      }
    }

    const payload = req.body || {};
    const errors = validateLeadPayload(payload);
    if (errors.length) {
      return res.status(400).json({
        ok: false,
        message: 'Validation failed',
        errors
      });
    }

    const fields = mapLeadPayloadToAirtableFields(payload);
    const created = await createLeadRecord(fields);
    const recordId = created.id;

    const nowIso = new Date().toISOString();
    try {
      await sendOwnerAlert(fields);
      fields['Owner Alert Sent'] = 'Yes';
      fields['Owner Alert Sent At'] = nowIso;
    } catch (err) {
      console.error('Owner alert email failed:', err.message);
    }

    try {
      await sendCustomerAutoReply(fields);
      fields['Customer Auto-Reply Sent'] = 'Yes';
      fields['Customer Auto-Reply Sent At'] = nowIso;
    } catch (err) {
      console.error('Customer auto-reply email failed:', err.message);
    }

    await updateLeadRecord(recordId, {
      'Owner Alert Sent': fields['Owner Alert Sent'],
      'Owner Alert Sent At': fields['Owner Alert Sent At'],
      'Customer Auto-Reply Sent': fields['Customer Auto-Reply Sent'],
      'Customer Auto-Reply Sent At': fields['Customer Auto-Reply Sent At']
    });

    return res.status(200).json({
      ok: true,
      message: 'Lead captured successfully',
      lead_id: fields['Lead ID'],
      airtable_record_id: recordId
    });
  } catch (err) {
    console.error('Lead webhook failed:', err.message);
    return res.status(500).json({
      ok: false,
      message: 'Server error while processing lead'
    });
  }
});

app.get(REPORTS_PATH, async (req, res) => {
  try {
    const month = monthKeyOrCurrent(req.query.month);
    const records = await listLeadRecordsForMonth(month);
    const summary = summarizeMonthly(records, month);
    return res.status(200).json(summary);
  } catch (err) {
    console.error('Monthly summary failed:', err.message);
    return res.status(500).json({
      ok: false,
      message: 'Could not generate monthly summary'
    });
  }
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'AI Business Brain HVAC Lead System',
    webhook_path: WEBHOOK_PATH,
    reports_path: REPORTS_PATH
  });
});

app.listen(PORT, () => {
  console.log(`AI Business Brain HVAC webhook server running on http://localhost:${PORT}`);
  console.log(`Lead webhook endpoint: http://localhost:${PORT}${WEBHOOK_PATH}`);
});
