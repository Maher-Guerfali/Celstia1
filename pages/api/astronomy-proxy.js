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
  // Filter out the path parameter which we handle separately
  const { path, ...restQuery } = query;
  
  return Object.entries(restQuery).reduce((acc, [key, value]) => {
    // Handle array values that might come as comma-separated strings
    if (typeof value === 'string' && value.includes(',')) {
      acc[key] = value; // Keep as is, already comma-separated
    }
    // Handle actual arrays
    else if (Array.isArray(value)) {
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
    // Extract path from query parameters
    // The astronomy-proxy route will be called with query params like:
    // ?bodies/positions/moon&latitude=40.7128&longitude=-74.0060&...
    let targetPath = '';
    const restParams = { ...req.query };
    
    // Find the path parameter - it's the one that starts with "bodies/"
    for (const key in req.query) {
      if (key.startsWith('bodies/')) {
        targetPath = key;
        delete restParams[key];
        break;
      }
    }
    
    // If no explicit path found in key, use the whole query as params
    // and check if we have an astronomy path in the query string
    if (!targetPath) {
      // Check if we have astronomy paths in any of the values
      const pathKeys = ['bodies/positions', 'bodies/positions/'];
      for (const pathKey of pathKeys) {
        if (Object.values(req.query).some(v => String(v).includes(pathKey))) {
          // Extract the path from query string
          const fullUrl = req.url;
          const match = fullUrl.match(/bodies\/positions(\/[^?&]+)?/);
          if (match) {
            targetPath = match[0];
          }
          break;
        }
      }
    }
    
    // Handle case where path might be in a different format or missing
    if (!targetPath) {
      console.log('No valid path found in query, checking for explicit parameters');
      
      // Check if we're dealing with a body positions request
      if (restParams.bodies) {
        targetPath = 'bodies/positions';
      } else if (restParams.body) {
        // If a specific body is requested
        targetPath = `bodies/positions/${restParams.body}`;
        delete restParams.body;
      }
    }
    
    // Final fallback - if we still can't determine the path
    if (!targetPath) {
      return res.status(400).json({ error: 'Could not determine API path from request' });
    }
    
    // Process remaining query parameters
    const processedQuery = processQueryParams(restParams);
    const queryString = new URLSearchParams(processedQuery).toString();
    
    // Construct full URL
    const url = `${API_URL}/${targetPath}${queryString ? `?${queryString}` : ''}`;
    
    console.log(`🔭 Fetching from Astronomy API: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API responded with status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Successfully fetched data for: ${targetPath}`);
    
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