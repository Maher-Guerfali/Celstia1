import CryptoJS from 'crypto-js';

const API_URL = 'https://api.astronomyapi.com/api/v2';
const APP_ID = process.env.ASTRONOMY_APP_ID;  // Your API Key
const APP_SECRET = process.env.ASTRONOMY_APP_SECRET;  // Your Secret

// Function to generate authentication headers
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

// API handler for proxying requests to Astronomy API
export default async function handler(req, res) {
  const { path } = req.query; // This will get the path you need from the frontend
  const url = `${API_URL}/${path}`;  // For example: /bodies/positions

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: getAuthHeaders(),
      body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
