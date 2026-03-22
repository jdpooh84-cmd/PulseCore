/**
 * PulseCore Server v6.0
 * Production-hardened Express server
 * - Claude API proxy (keeps key server-side)
 * - Rate limiting
 * - Security headers
 * - Health endpoint
 * - Static file serving with proper caching
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const path    = require('path');

// Load .env if present (local dev)
try { require('dotenv').config(); } catch(e) {}

const app  = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const APP_URL = process.env.APP_URL || 'http://localhost:' + PORT;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

/* ── Body parsing ── */
app.use(express.json({ limit: '1mb' }));

/* ── Security headers ── */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'microphone=(self), camera=()');
  next();
});

/* ── CORS ── */
app.use(cors({
  origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-session-id'],
}));

/* ── Rate limiting ── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a few minutes and try again.' },
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
});

/* ── Health check ── */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '6.0',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!ANTHROPIC_API_KEY,
    environment: process.env.NODE_ENV || 'development',
    url: APP_URL
  });
});

/* ── Claude API proxy ── */
app.post('/api/claude', apiLimiter, async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: {
        type: 'no_api_key',
        message: 'Server API key not configured. Add ANTHROPIC_API_KEY to your .env file.'
      }
    });
  }

  const { model, max_tokens, system, messages, tools } = req.body;

  // Validate required fields
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: { message: 'messages array is required.' } });
  }

  const body = {
    model: model || 'claude-sonnet-4-20250514',
    max_tokens: Math.min(max_tokens || 2000, 4096), // cap at 4096
    system: system || 'You are a helpful assistant.',
    messages,
  };
  if (tools) body.tools = tools;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  // Add web search beta header if tools include web_search
  if (tools && tools.some(t => t.name === 'web_search')) {
    headers['anthropic-beta'] = 'web-search-2025-03-05';
  }

  try {
    // Dynamic import for node-fetch compatibility
    const fetch = (await import('node-fetch')).default;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeout: 60000, // 60s timeout
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);

  } catch(err) {
    console.error('[Claude proxy error]', err.message);
    res.status(502).json({
      error: {
        type: 'proxy_error',
        message: 'Could not reach Anthropic API. Please try again.'
      }
    });
  }
});

/* ── Static files ── */
const publicDir = path.join(__dirname, '..', 'public');

// Cache static assets (icons, sw, manifest)
app.use('/manifest.json', express.static(publicDir, { maxAge: '1d' }));
app.use('/sw.js', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Service-Worker-Allowed', '/');
  next();
}, express.static(publicDir));
app.use('/icon-192.png', express.static(publicDir, { maxAge: '7d' }));
app.use('/icon-512.png', express.static(publicDir, { maxAge: '7d' }));

// Main app — no cache for index.html (always fresh)
app.use(express.static(publicDir, { maxAge: 0 }));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/health')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(publicDir, 'index.html'));
  } else {
    res.status(404).json({ error: { message: 'Endpoint not found.' } });
  }
});

/* ── Error handler ── */
app.use((err, req, res, next) => {
  console.error('[Unhandled error]', err.message);
  res.status(500).json({ error: { message: 'An unexpected error occurred.' } });
});

/* ── Start ── */
const server = app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║     PulseCore v6.0 — RUNNING          ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
  console.log('  Local:   http://localhost:' + PORT);
  console.log('  Network: ' + APP_URL);
  console.log('  API key: ' + (ANTHROPIC_API_KEY ? '✓ configured' : '✗ NOT SET — add to .env'));
  console.log('');
  console.log('  Open Chrome and go to: http://localhost:' + PORT);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { server.close(() => process.exit(0)); });
