const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'web-build-prod', req.url === '/' ? 'index.html' : req.url);

  if (fs.existsSync(filePath)) {
    if (fs.statSync(filePath).isDirectory()) {
      filePath = path.join(__dirname, 'web-build-prod', 'index.html');
    }
    // else serve the file
  } else {
    if (!path.extname(req.url)) {
      filePath = path.join(__dirname, 'web-build-prod', 'index.html');
    } else {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
  }

  const ext = path.extname(filePath);
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.map': 'application/json'  // for source maps
  }[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

const PORT = 8081;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});