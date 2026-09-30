import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'public');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

for (const name of ['assets', 'media', 'produto', 'checkout', 'politicas', 'rastreio']) {
  await fs.cp(path.join(root, name), path.join(out, name), { recursive: true });
}
for (const name of ['favicon.png', 'apple-touch-icon.png', 'site.webmanifest']) {
  await fs.copyFile(path.join(root, name), path.join(out, name));
}

const checkout = path.join(out, 'checkout', 'index.html');
let html = await fs.readFile(checkout, 'utf8');
const notice = '<div role="status" style="position:relative;z-index:1000;background:#fff0b8;color:#242424;text-align:center;padding:10px 16px;font:600 13px/1.4 Arial,sans-serif">Prévia do checkout: pedidos e pagamentos estão indisponíveis neste site.</div>';
html = html.replace('<body>', `<body>${notice}`);
await fs.writeFile(checkout, html);
console.log('Arquivos estáticos prontos em public/');
