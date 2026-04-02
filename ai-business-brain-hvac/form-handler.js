'use strict';

(function () {
  const form = document.getElementById('ai-business-brain-lead-form');
  const submitButton = document.getElementById('submit-button');
  const statusBox = document.getElementById('form-status');
  if (!form || !submitButton || !statusBox) return;

  // Replace this with your real hosted URL after deployment.
  const webhookUrl = 'http://localhost:8787/webhook/lead';
  // Must match WEBHOOK_SECRET in your server .env file.
  const webhookSecret = 'change-this-to-a-long-random-secret';

  function setStatus(text, isError) {
    statusBox.textContent = text;
    statusBox.style.color = isError ? '#9b1c1c' : '#14532d';
    statusBox.style.background = isError ? '#fee2e2' : '#dcfce7';
    statusBox.style.borderColor = isError ? '#fca5a5' : '#86efac';
    statusBox.style.display = 'block';
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function buildPayload() {
    const fd = new FormData(form);
    return {
      first_name: String(fd.get('first_name') || '').trim(),
      last_name: String(fd.get('last_name') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      service_needed: String(fd.get('service_needed') || '').trim(),
      urgency: String(fd.get('urgency') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      source_page: 'Coastal Comfort HVAC Website Lead Form',
      business_name: 'Coastal Comfort HVAC',
      business_city: 'Chesapeake',
      business_state: 'Virginia',
      service_category: 'HVAC',
      offer_name: 'AI Business Brain',
      utm_source: getQueryParam('utm_source'),
      utm_medium: getQueryParam('utm_medium'),
      utm_campaign: getQueryParam('utm_campaign')
    };
  }

  async function onSubmit(event) {
    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    setStatus('Submitting your request...', false);

    try {
      const payload = buildPayload();
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': webhookSecret
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || 'Something went wrong.');
      }

      setStatus('Thank you! Your request was sent. Coastal Comfort HVAC will contact you shortly.', false);
      form.reset();
    } catch (error) {
      setStatus(`Could not submit form: ${error.message}`, true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Request';
    }
  }

  form.addEventListener('submit', onSubmit);
})();
