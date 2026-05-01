const http = require('http');

const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Cloud Run minimal server works\n');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server listening on port ${PORT}`);
});
