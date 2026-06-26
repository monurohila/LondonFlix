// Optional local preview server. Vercel deploy serves the /public directory statically.
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
function serve(file, res){
  fs.readFile(file, (err, data)=>{
    if(err){ res.writeHead(404, {'content-type':'text/html'}); return res.end('Not found'); }
    res.writeHead(200, {'content-type': types[path.extname(file)] || 'application/octet-stream'}); res.end(data);
  });
}
http.createServer((req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host}`);
  if(url.pathname === '/api/content') return serve(path.join(PUBLIC,'data/content.json'), res);
  if(url.pathname.startsWith('/watch/')) return serve(path.join(PUBLIC,'watch.html'), res);
  let pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  if(pathname === '/browse') pathname = '/browse.html';
  if(pathname === '/pricing') pathname = '/pricing.html';
  const safe = path.normalize(pathname).replace(/^([.][.][\/])+/, '');
  serve(path.join(PUBLIC, safe), res);
}).listen(PORT, ()=> console.log(`LondonFlix demo: http://localhost:${PORT}`));
