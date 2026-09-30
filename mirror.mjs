import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const origin = 'https://centralidealbr.com';
const pages = new Map([
  ['/produto/autobar', 'produto/autobar/index.html'],
  ['/checkout', 'checkout/index.html'],
  ['/politicas', 'politicas/index.html'],
  ['/rastreio', 'rastreio/index.html'],
]);
const queue = [];
const seen = new Set();

async function save(urlPath, localPath) {
  const response = await fetch(origin + urlPath);
  if (!response.ok) throw new Error(`${urlPath}: ${response.status}`);
  const target = path.join(root, localPath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const body = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(target, body);
  console.log(`${urlPath} → ${localPath} (${body.length} bytes)`);
  return body;
}

function discover(content) {
  const text = content.toString('utf8');
  const assets = text.matchAll(/(?:\/assets\/|\.\/)([A-Za-z0-9._-]+\.(?:js|css|png|jpe?g|webp|svg|woff2?|mp4))/g);
  for (const match of assets) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      queue.push(name);
    }
  }
}

for (const [urlPath, localPath] of pages) {
  const body = await save(urlPath, localPath);
  discover(body);
}
for (const file of ['favicon.png', 'apple-touch-icon.png', 'site.webmanifest']) {
  try { await save('/' + file, file); } catch (error) { console.warn(String(error)); }
}
while (queue.length) {
  const name = queue.shift();
  try {
    const body = await save('/assets/' + name, 'assets/' + name);
    if (/\.(?:js|css)$/.test(name) && !/^(?:index-|routes-|Admin-|admin777\.)/.test(name)) discover(body);
  } catch (error) {
    console.warn(String(error));
  }
}
