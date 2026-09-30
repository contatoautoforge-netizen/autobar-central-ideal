import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = [
  ['produto/autobar/index.html', 'AutoBar™'],
  ['checkout/index.html', 'Checkout seguro'],
  ['pagamento-pix/index.html', 'Pagamento Pix'],
  ['politicas/index.html', 'Política'],
  ['rastreio/index.html', 'Rastrear'],
];
let checked = 0;
for (const [name, marker] of pages) {
  const html = await fs.readFile(path.join(root, name), 'utf8');
  if (!html.includes(marker)) throw new Error(`${name}: conteúdo esperado ausente`);
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|media)\/[^"?]+)"/g)) {
    const file = path.resolve(root, '.' + match[1]);
    const stat = await fs.stat(file).catch(() => null);
    if (!stat?.isFile() || stat.size === 0) throw new Error(`${name}: recurso ausente ${match[1]}`);
    checked++;
  }
}
const built=await fs.readFile(path.join(root,'public','produto','autobar','index.html'),'utf8');
const marketing=await fs.readFile(path.join(root,'public','marketing.js'),'utf8');
if(!built.includes('/marketing.js')||!built.includes('cdn.utmify.com.br/scripts/utms/latest.js')||!marketing.includes('DAT8TNJC77U5PB60DTT0')||!marketing.includes('969483765461099')||!marketing.includes('6aba22903679022ae64e1ad7'))throw Error('Pixels da GelaCar não estão presentes no build');
console.log(`OK: ${pages.length} páginas, ${checked} referências locais e pixels compartilhados`);
