const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const PORT = 3001;

app.get('/api/horizons', async (req, res) => {
  try {
    const response = await axios.get('https://ssd.jpl.nasa.gov/api/horizons.api', {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch data from NASA API' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});