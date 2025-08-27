const http = require('http');
const url = require('url');
const port = 8080;

const VERIFY_TOKEN = "adminbot2025";

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    const query = url.parse(req.url, true).query;

    if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED");
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(query['hub.challenge']);
    } else {
      res.writeHead(403);
      res.end('Forbidden');
    }

  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Incoming message:', body);
      res.writeHead(200);
      res.end('OK');
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on ${port}`);
});
