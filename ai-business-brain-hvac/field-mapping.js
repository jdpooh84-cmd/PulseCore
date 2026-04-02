'use strict';

function safe(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizePhone(value) {
  const raw = safe(value);
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

function monthBucket(isoDateString) {
  const d = new Date(isoDateString);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function mapLeadPayloadToAirtableFields(payload) {
  const nowIso = new Date().toISOString();
  const firstName = safe(payload.first_name);
  const lastName = safe(payload.last_name);
  const fullName = `${firstName} ${lastName}`.trim();
  const businessName = safe(payload.business_name) || 'Coastal Comfort HVAC';
  const businessCity = safe(payload.business_city) || 'Chesapeake';
  const businessState = safe(payload.business_state) || 'Virginia';
  const offerName = safe(payload.offer_name) || 'AI Business Brain';
  const serviceCategory = safe(payload.service_category) || 'HVAC';
  const sourcePage = safe(payload.source_page) || 'Website Lead Form';

  return {
    'Lead ID': `lead_${Date.now()}`,
    'Created At': nowIso,
    'Report Month': monthBucket(nowIso),
    'Business Name': businessName,
    'Business City': businessCity,
    'Business State': businessState,
    'Offer Name': offerName,
    'Service Category': serviceCategory,
    'First Name': firstName,
    'Last Name': lastName,
    'Full Name': fullName,
    Email: safe(payload.email).toLowerCase(),
    Phone: normalizePhone(payload.phone),
    'Service Needed': safe(payload.service_needed),
    Urgency: safe(payload.urgency) || 'Normal',
    Message: safe(payload.message),
    'Source Page': sourcePage,
    'UTM Source': safe(payload.utm_source),
    'UTM Medium': safe(payload.utm_medium),
    'UTM Campaign': safe(payload.utm_campaign),
    Status: 'New',
    'Owner Alert Sent': 'No',
    'Customer Auto-Reply Sent': 'No',
    'Owner Alert Sent At': '',
    'Customer Auto-Reply Sent At': ''
  };
}

function validateLeadPayload(payload) {
  const errors = [];
  const email = safe(payload.email);

  if (safe(payload.website)) errors.push('spam detected');
  if (!safe(payload.first_name)) errors.push('first_name is required');
  if (!safe(payload.last_name)) errors.push('last_name is required');
  if (!email) errors.push('email is required');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email is invalid');
  if (!safe(payload.phone)) errors.push('phone is required');
  if (!safe(payload.service_needed)) errors.push('service_needed is required');
  if (!safe(payload.message)) errors.push('message is required');
  return errors;
}

module.exports = {
  mapLeadPayloadToAirtableFields,
  validateLeadPayload
};
