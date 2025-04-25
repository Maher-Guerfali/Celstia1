// File: pages/api/astronomy-proxy.js

import CryptoJS from 'crypto-js';

const API_URL = 'https://api.astronomyapi.com/api/v2';
const APP_ID = process.env.ASTRONOMY_APP_ID;
const APP_SECRET = process.env.ASTRONOMY_APP_SECRET;

// Generate authentication headers for Astronomy API
const getAuthHeaders = () => {
  const date = new Date().toUTCString();
  const hash = CryptoJS.HmacSHA256(date, APP_SECRET);
  const signature = CryptoJS.enc.Base64.stringify(hash);

  return {
    'Authorization': `Basic ${Buffer.from(`${APP_ID}:${signature}`).toString('base64')}`,
    'X-Requested-With': 'XMLHttpRequest',
    'Date': date,
    'Content-Type': 'application/json',
  };
};

// API route handler: proxies requests to Astronomy API
export default async function handler(req, res) {
  const { path, ...query } = req.query; // path: e.g. 'bodies/positions' or 'bodies/positions/moon'
  
  // Build query string for GET requests
  const queryString = Object.entries(query)
    .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
    .join('&');

  // Construct full URL
  const url = `${API_URL}/${path}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: getAuthHeaders(),
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Astronomy Proxy Error:', error);
    res.status(500).json({ error: error.message });
  }
}