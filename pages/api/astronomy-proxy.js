// File: pages/api/astronomy-proxy.js

import CryptoJS from 'crypto-js';

const API_URL = 'https://api.astronomyapi.com/api/v2';
const APP_ID = process.env.ASTRONOMY_APP_ID;
const APP_SECRET = process.env.ASTRONOMY_APP_SECRET;

// Validate environment variables
if (!APP_ID || !APP_SECRET) {
  throw new Error('Missing required environment variables: ASTRONOMY_APP_ID and/or ASTRONOMY_APP_SECRET');
}

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

// Process query parameters safely
const processQueryParams = (query) => {
  return Object.entries(query).reduce((acc, [key, value]) => {
    // Handle array values
    if (Array.isArray(value)) {
      acc[key] = value.join(',');
    } 
    // Handle null/undefined
    else if (value != null) {
      acc[key] = String(value);
    }
    return acc;
  }, {});
};

// API route handler: proxies requests to Astronomy API
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { path, ...query } = req.query;

    // Validate required path parameter
    if (!path) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Process query parameters
    const processedQuery = processQueryParams(query);
    const queryString = new URLSearchParams(processedQuery).toString();

    // Construct full URL
    const url = `${API_URL}/${path}${queryString ? `?${queryString}` : ''}`;

    console.log(`🔭 Fetching from Astronomy API: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Successfully fetched data for: ${path}`);
    
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Astronomy Proxy Error:', {
      message: error.message,
      stack: error.stack,
    });
    
    return res.status(500).json({ 
      error: 'Failed to fetch astronomical data',
      details: error.message 
    });
  }
}
