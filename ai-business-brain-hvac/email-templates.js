'use strict';

const fs = require('fs');
const path = require('path');

function readTemplate(fileName) {
  const templatePath = path.join(__dirname, 'templates', fileName);
  return fs.readFileSync(templatePath, 'utf8');
}

function renderTemplate(template, data) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, token) => {
    return data[token] === undefined || data[token] === null ? '' : String(data[token]);
  });
}

function ownerAlertContent(fields) {
  const template = readTemplate('owner-alert-email.txt');
  return renderTemplate(template, {
    BUSINESS_NAME: fields['Business Name'],
    FULL_NAME: fields['Full Name'],
    EMAIL: fields.Email,
    PHONE: fields.Phone,
    SERVICE_NEEDED: fields['Service Needed'],
    URGENCY: fields.Urgency,
    MESSAGE: fields.Message,
    SOURCE_PAGE: fields['Source Page'],
    UTM_SOURCE: fields['UTM Source'],
    UTM_MEDIUM: fields['UTM Medium'],
    UTM_CAMPAIGN: fields['UTM Campaign'],
    CREATED_AT: fields['Created At'],
    LEAD_ID: fields['Lead ID']
  });
}

function customerAutoReplyContent(fields) {
  const template = readTemplate('customer-auto-reply-email.txt');
  return renderTemplate(template, {
    FIRST_NAME: fields['First Name'],
    BUSINESS_NAME: fields['Business Name'],
    BUSINESS_CITY: fields['Business City'],
    BUSINESS_STATE: fields['Business State'],
    SERVICE_NEEDED: fields['Service Needed'],
    OFFER_NAME: fields['Offer Name'],
    BUSINESS_PHONE: process.env.BUSINESS_PHONE || '(757) 555-0147',
    BUSINESS_OWNER_NAME: process.env.BUSINESS_OWNER_NAME || 'Coastal Comfort HVAC Team'
  });
}

module.exports = {
  ownerAlertContent,
  customerAutoReplyContent
};
