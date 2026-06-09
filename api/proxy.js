const https = require('https');

module.exports = (req, res) => {
  // CORS Headers so client can call it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint } = req.query;
  
  if (!endpoint) {
    res.status(400).json({ error: 'Endpoint query param is required' });
    return;
  }

  const token = req.headers['x-auth-token'];
  const targetUrl = `https://api.football-data.org/v4${endpoint}`;

  const options = {
    headers: {
      'X-Auth-Token': token || ''
    }
  };

  https.get(targetUrl, options, (apiRes) => {
    res.status(apiRes.statusCode);
    
    // Copy content type header
    const contentType = apiRes.headers['content-type'];
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    apiRes.pipe(res);
  }).on('error', (err) => {
    console.error('Vercel proxy request error:', err);
    res.status(500).json({ error: 'Failed to fetch from API', details: err.message });
  });
};
