const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  
  // CORS Proxy Endpoint
  if (urlObj.pathname === '/api/proxy') {
    const endpoint = urlObj.searchParams.get('endpoint');
    const provider = urlObj.searchParams.get('provider');
    if (!endpoint) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Endpoint query param is required' }));
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
      res.writeHead(apiRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      apiRes.pipe(res);
    }).on('error', (err) => {
      console.error('Proxy request error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch from API', details: err.message }));
    });
    return;
  }
  
  // Serve static files
  let filePath = path.join(__dirname, urlObj.pathname === '/' ? 'index.html' : urlObj.pathname);
  
  // Safety check: ensure file is inside this directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      let contentType = 'text/html';
      const ext = path.extname(filePath);
      if (ext === '.js') contentType = 'text/javascript';
      if (ext === '.css') contentType = 'text/css';
      if (ext === '.json') contentType = 'application/json';
      if (ext === '.png') contentType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

function startServer(port) {
  server.listen(port, () => {
    const localUrl = `http://localhost:${port}`;
    console.log(`========================================================`);
    console.log(`Servidor rodando em: ${localUrl}`);
    console.log(`Para usar a Tabela da Copa, acesse o link acima no navegador.`);
    console.log(`========================================================`);
    
    // Automatically open the URL in browser
    const startCmd = process.platform === 'win32' ? `start "" "${localUrl}"` :
                     process.platform === 'darwin' ? `open "${localUrl}"` :
                     `xdg-open "${localUrl}"`;
    exec(startCmd);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${port} em uso, tentando porta ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Erro ao iniciar o servidor:', err);
    }
  });
}

startServer(PORT);
