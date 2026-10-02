import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = [
  ['produto/autobar/index.html', 'AutoBar™'],
  ['produto/agrobar/index.html', 'AgroBar™'],
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
if(!built.includes('GelaBar™')||built.includes('AutoBar™')||!built.includes('/brand/gelabar-logo.svg'))throw Error('Marca GelaBar ausente do produto');
if(!built.includes('rel="canonical" href="https://gelabar.vercel.app/produto/autobar"')||!built.includes('property="og:url" content="https://gelabar.vercel.app/produto/autobar"')||!built.includes('"price":"79.00"'))throw Error('Domínio ou preço GelaBar ausente dos metadados do produto');
if(!built.includes('/variant-switch.js'))throw Error('Seletor de variações ausente do GelaBar');
const agrobar=await fs.readFile(path.join(root,'public','produto','agrobar','index.html'),'utf8');
if(!agrobar.includes('671 avaliações')||!agrobar.includes('R$ 79,00')||!agrobar.includes('R$ 119,00')||!agrobar.includes('gelabar.vercel.app/produto/agrobar'))throw Error('Página AgroBar incompleta');
for(const name of ['agrobar-1.webp','agrobar-2.webp','agrobar-3.webp','agrobar-4.webp','agrobar-review-1.webp','agrobar-review-2.webp','agrobar-review-3.webp','agrobar-review-4.webp'])if(!(await fs.stat(path.join(root,'public','media',name)).catch(()=>null))?.size)throw Error(`Mídia AgroBar ausente: ${name}`);
const builtCheckout=await fs.readFile(path.join(root,'public','checkout','index.html'),'utf8');
const checkoutLogic=await fs.readFile(path.join(root,'public','checkout','autobar-checkout.js'),'utf8');
if(builtCheckout.includes('AutoBar')||!builtCheckout.includes('GelaBar')||!checkoutLogic.includes('GelaBar™')||!checkoutLogic.includes('gelabar-thumb.jpg'))throw Error('Marca GelaBar ausente do checkout');
for(const name of ['gelabar-logo.svg','gelabar-logo-white.svg','gelabar-favicon.png','gelabar-touch.png','gelabar-192.png','gelabar-512.png'])if(!(await fs.stat(path.join(root,'public','brand',name)).catch(()=>null))?.size)throw Error(`Logo ausente: ${name}`);
const marketing=await fs.readFile(path.join(root,'public','marketing.js'),'utf8');
if(!built.includes('/marketing.js')||!built.includes('cdn.utmify.com.br/scripts/utms/latest.js')||!marketing.includes('DAT8TNJC77U5PB60DTT0')||!marketing.includes('969483765461099')||marketing.includes('cdn.utmify.com.br/scripts/pixel/pixel.js'))throw Error('Pixels da GelaCar não estão presentes no build');
const checkout=await fs.readFile(path.join(root,'public','assets','checkout-C2qFdlwJ.js'),'utf8');
if(!checkout.includes('Digite um celular ou telefone válido com DDD')||!checkout.includes('CPF inválido. Verifique e tente novamente.')||!checkout.includes('Digite um CEP válido'))throw Error('Validações do checkout ausentes');
console.log(`OK: ${pages.length} páginas, ${checked} referências locais e pixels compartilhados`);
