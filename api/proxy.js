const https = require('https');

module.exports = (req, res) => {
  // CORS Headers so client can call it
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-Auth-Token, X-Api-Sports-Key, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint, provider } = req.query;
  
  if (!endpoint) {
    res.status(400).json({ error: 'Endpoint query param is required' });
    return;
  }

  let targetUrl;
  let headers = {};

  if (provider === 'apifootball') {
    targetUrl = `https://v3.football.api-sports.io${endpoint}`;
    const key = req.headers['x-api-sports-key'];
    headers['x-apisports-key'] = key || '';
  } else {
    targetUrl = `https://api.football-data.org/v4${endpoint}`;
    const token = req.headers['x-auth-token'];
    headers['X-Auth-Token'] = token || '';
  }

  const options = {
    headers: headers
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
