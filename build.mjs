import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'public');
if (!out.startsWith(root + path.sep)) throw new Error('Diretório de saída inválido');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

for (const name of ['assets', 'media', 'produto', 'checkout', 'politicas', 'rastreio']) {
  await fs.cp(path.join(root, name), path.join(out, name), { recursive: true });
}
for (const name of ['favicon.png', 'apple-touch-icon.png', 'site.webmanifest', 'checkout-notice.js']) {
  await fs.copyFile(path.join(root, name), path.join(out, name));
}

for (const route of ['produto/autobar', 'checkout', 'politicas', 'rastreio']) {
  const page = path.join(out, route, 'index.html');
  let html = await fs.readFile(page, 'utf8');
  html = html.replace('</head>', '<script defer src="/checkout-notice.js"></script></head>');
  await fs.writeFile(page, html);
}
console.log('Arquivos estáticos prontos em public/');
