// proxy-server.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const APP_ID = process.env.ASTRONOMY_API_APP_ID;
const APP_SECRET = process.env.ASTRONOMY_API_SECRET;

app.post('/astronomy', async (req, res) => {
  const date = new Date().toUTCString();
  const signature = crypto
    .createHmac('sha256', APP_SECRET)
    .update(date)
    .digest('base64');

  const headers = {
    'Authorization': `Basic ${Buffer.from(`${APP_ID}:${signature}`).toString('base64')}`,
    'X-Requested-With': 'XMLHttpRequest',
    'Date': date,
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch('https://api.astronomyapi.com/api/v2/bodies/positions', {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
