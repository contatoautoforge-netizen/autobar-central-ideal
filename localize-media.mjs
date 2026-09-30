import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = ['produto/autobar/index.html', 'checkout/index.html', 'politicas/index.html', 'rastreio/index.html'];
const pattern = /https:\/\/(?:ysinsqbpzkriegpslvti\.supabase\.co\/storage\/v1\/(?:render\/image|object)\/sign\/product-images\/[^"'<>\\\s]+?\?token=[A-Za-z0-9._-]+|centralidealbr\.com\/__l5e\/assets-v1\/[A-Za-z0-9/._-]+)/g;
const map = new Map();

for (const page of pages) {
  let html = await fs.readFile(path.join(root, page), 'utf8');
  for (const url of new Set(html.match(pattern) || [])) {
    if (!map.has(url)) {
      const ext = new URL(url).pathname.match(/\.[A-Za-z0-9]+$/)?.[0] || '.bin';
      const name = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16) + ext;
      const target = path.join(root, 'media', name);
      await fs.mkdir(path.dirname(target), { recursive: true });
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(String(response.status));
        await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
        map.set(url, '/media/' + name);
        console.log(`${new URL(url).pathname} → media/${name}`);
      } catch (error) {
        console.warn(`Mídia não copiada: ${new URL(url).pathname}: ${error}`);
      }
    }
    if (map.has(url)) html = html.replaceAll(url, map.get(url));
  }
  await fs.writeFile(path.join(root, page), html);
}
console.log(`${map.size} mídias locais`);
