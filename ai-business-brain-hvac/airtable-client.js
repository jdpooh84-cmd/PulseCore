'use strict';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getAirtableConfig() {
  return {
    apiKey: requiredEnv('AIRTABLE_API_KEY'),
    baseId: requiredEnv('AIRTABLE_BASE_ID'),
    tableName: process.env.AIRTABLE_TABLE_NAME || 'Leads'
  };
}

function airtableTablePath() {
  const { baseId, tableName } = getAirtableConfig();
  return `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;
}

async function airtableRequest(url, options) {
  const { apiKey } = getAirtableConfig();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Airtable API error (${response.status}): ${responseText}`);
  }

  if (!responseText) return {};
  return JSON.parse(responseText);
}

async function createLeadRecord(fields) {
  const url = airtableTablePath();
  const body = { fields };
  return airtableRequest(url, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

async function updateLeadRecord(recordId, fields) {
  const url = `${airtableTablePath()}/${recordId}`;
  const body = { fields };
  return airtableRequest(url, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

async function listLeadRecordsForMonth(monthKey) {
  const tableUrl = airtableTablePath();
  const records = [];
  let offset = '';

  do {
    const filterFormula = `{Report Month}='${monthKey}'`;
    const params = new URLSearchParams({
      pageSize: '100',
      filterByFormula: filterFormula
    });
    if (offset) params.append('offset', offset);

    const pageUrl = `${tableUrl}?${params.toString()}`;
    const page = await airtableRequest(pageUrl, { method: 'GET' });
    if (Array.isArray(page.records)) {
      records.push(...page.records);
    }
    offset = page.offset || '';
  } while (offset);

  return records;
}

module.exports = {
  createLeadRecord,
  updateLeadRecord,
  listLeadRecordsForMonth
};
