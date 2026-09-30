import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3001);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
};
const routes = new Map([
  ['/', '/produto/autobar/index.html'],
  ['/produto/autobar', '/produto/autobar/index.html'],
  ['/checkout', '/checkout/index.html'],
  ['/politicas', '/politicas/index.html'],
  ['/rastreio', '/rastreio/index.html'],
]);

http.createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    pathname = routes.get(pathname) || pathname;
    const target = path.resolve(root, '.' + pathname);
    if (!target.startsWith(root + path.sep)) {
      response.writeHead(403); response.end(); return;
    }
    const body = await fs.readFile(target);
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Página não encontrada');
  }
}).listen(port, '127.0.0.1', () => console.log(`AutoBar local: http://127.0.0.1:${port}`));
