// Zenvia Assistant: tiny static file server (no dependencies).
// Serving over http://localhost lets the browser remember the microphone permission.
const http = require('http');
const fs = require('fs');
const path = require('path');

try { // optional: load PORT from a local .env file
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  });
} catch (e) { /* no .env file, that is fine */ }

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = path.join(__dirname, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'microphone=(self), camera=()'
};

const proxy = require('./netlify/functions/chat.js'); // same API proxy that Netlify runs
const PROXY_PATH = '/.netlify/functions/chat';

const server = http.createServer((req, res) => {
  if (req.url.split('?')[0] === PROXY_PATH) { // local copy of the Netlify function
    const chunks = [];
    let size = 0;
    req.on('data', c => { size += c.length; if (size > 200000) req.destroy(); else chunks.push(c); });
    req.on('end', async () => {
      const u = new URL(req.url, 'http://x');
      const out = await proxy.handler({
        httpMethod: req.method,
        headers: req.headers,
        queryStringParameters: Object.fromEntries(u.searchParams),
        body: Buffer.concat(chunks).toString('utf8')
      });
      res.writeHead(out.statusCode, out.headers);
      res.end(out.body);
    });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end('Method Not Allowed');
  }

  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch (e) { res.writeHead(400); return res.end('Bad Request'); }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...HEADERS });
    return res.end(JSON.stringify({ status: 'ok' }));
  }

  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.normalize(path.join(ROOT, pathname));
  if (!file.startsWith(ROOT + path.sep)) { // block ../ path traversal
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...HEADERS });
      return res.end('404 Not Found');
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      ...HEADERS
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Zenvia Assistant running at http://localhost:${PORT}`);
});
