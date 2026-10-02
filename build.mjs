import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {renderAutobarCheckout} from './checkout/render.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'public');
if (!out.startsWith(root + path.sep)) throw new Error('Diretório de saída inválido');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

for (const name of ['assets', 'media', 'brand', 'produto', 'checkout', 'pagamento-pix', 'politicas', 'rastreio']) {
  await fs.cp(path.join(root, name), path.join(out, name), { recursive: true });
}
for (const name of ['favicon.png', 'apple-touch-icon.png', 'site.webmanifest', 'checkout-notice.js', 'checkout-bridge.js', 'marketing.js', 'pix.js']) {
  await fs.copyFile(path.join(root, name), path.join(out, name));
}
await fs.writeFile(path.join(out,'checkout','index.html'),await renderAutobarCheckout(root));
await fs.rm(path.join(out,'checkout','gelacar-template.html'));
await fs.rm(path.join(out,'checkout','render.mjs'));

for (const route of ['produto/autobar', 'politicas', 'rastreio']) {
  const page = path.join(out, route, 'index.html');
  let html = await fs.readFile(page, 'utf8');
  html=html.replaceAll('AutoBar','GelaBar').replaceAll('/media/1741b8ef711bc4a8.png','/brand/gelabar-logo.svg').replaceAll('/media/2cee687217d56fde.png','/brand/gelabar-logo.svg').replaceAll('/media/c18a77036ddbdcd3.png','/brand/gelabar-logo-white.svg');
  if(route==='produto/autobar')html=html.replaceAll('https://centralidealbr.com/produto/autobar','https://gelabar.vercel.app/produto/autobar');
  html=html.replaceAll('/media/fd5d694cc3f25a88.webp','/media/gelabar-gallery-1.jpg').replaceAll('/media/66165014bfa0c775.webp','/media/gelabar-gallery-2.jpg').replaceAll('/media/a1e9bde41cf61aa9.webp','/media/gelabar-thumb.jpg').replaceAll('aria-label="Central Ideal — Início"','aria-label="GelaBar — Início"').replaceAll('alt="Central Ideal"','alt="GelaBar"');
  html=html.replaceAll('href="/favicon.png" type="image/png" sizes="64x64"','href="/brand/gelabar-favicon.png" type="image/png" sizes="64x64"').replaceAll('href="/apple-touch-icon.png"','href="/brand/gelabar-touch.png"');
  html = html.replace("connect-src 'self'", "connect-src 'self' https://personalizecar.vercel.app");
  html = html.replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' https://analytics.tiktok.com https://connect.facebook.net https://cdn.utmify.com.br");
  html = html.replace("connect-src 'self' https://personalizecar.vercel.app", "connect-src 'self' https://personalizecar.vercel.app https://analytics.tiktok.com https://*.tiktok.com https://www.facebook.com https://cdn.utmify.com.br");
  html = html.replace('<strong class="text-neutral-600">5% de cashback</strong> para a próxima compra','<strong class="text-neutral-600">Pagamento via Pix</strong> com confirmação automática');
  html = html.replace('Diversão, conforto e segurança.','Praticidade para sua viagem.').replace('Receba ofertas exclusivas, novidades e dicas para a criançada assinando nossa newsletter.','Receba novidades e ofertas exclusivas da Central Ideal.');
  html = html.replaceAll('Pix e cartão em até 12x.','Pagamento via Pix.');
  if(route==='produto/autobar'){
    for(const [before,after] of [
      ['"price":"18410.00"','"price":"79.00"'],['price:18410','price:7900'],
      ['R$\u00a0184,10','R$\u00a079,00'],['R$\u00a0331,38','R$\u00a0119,00'],
      ['R$\u00a0115,90','R$\u00a0221,00'],['R$\u00a0268,62','R$\u00a0481,00'],
      ['39<!-- -->% OFF','74<!-- -->% OFF'],['45<!-- -->% OFF','80<!-- -->% OFF']
    ]){
      if(!html.includes(before))throw Error(`Preço exibido mudou: ${before}`);
      html=html.replaceAll(before,after);
    }
  }
  html = html.replace('</head>', '<style>div.mt-8.flex.flex-wrap.items-center.gap-2:has(> img[alt="Visa"]) > img { display:none!important }div.mt-8.flex.flex-wrap.items-center.gap-2:has(> img[alt="Visa"])::after { content:"Pix";display:inline-block;background:#fff;color:#262626;border-radius:4px;padding:6px 18px;font-weight:700 }</style><script src="https://cdn.utmify.com.br/scripts/utms/latest.js" data-utmify-prevent-xcod-sck data-utmify-prevent-subids async defer></script><script src="/checkout-bridge.js"></script><script defer src="/marketing.js"></script><script defer src="/checkout-notice.js"></script></head>');
  await fs.writeFile(page, html);
}
{
  const page=path.join(out,'pagamento-pix','index.html');let html=await fs.readFile(page,'utf8');
  html=html.replace("script-src 'self'", "script-src 'self' https://analytics.tiktok.com https://connect.facebook.net https://cdn.utmify.com.br").replace("img-src 'self' data:","img-src 'self' data: https:").replace("connect-src 'self' https://personalizecar.vercel.app", "connect-src 'self' https://personalizecar.vercel.app https://analytics.tiktok.com https://*.tiktok.com https://www.facebook.com https://cdn.utmify.com.br");
  html=html.replace('/media/2cee687217d56fde.png','/brand/gelabar-logo.svg').replace('href="/favicon.png"','href="/brand/gelabar-favicon.png"').replace('</head>','<script src="https://cdn.utmify.com.br/scripts/utms/latest.js" data-utmify-prevent-xcod-sck data-utmify-prevent-subids async defer></script><script defer src="/marketing.js"></script></head>');await fs.writeFile(page,html);
}
const productBundle=path.join(out,'assets','produto._slug-BeuPeFaD.js');
let product=await fs.readFile(productBundle,'utf8');
const uploadMarker='let i=`vehicle-photos/${crypto.randomUUID()}.${r.extension}`,{error:o}={error:null};';
if(!product.includes(uploadMarker))throw Error('Trecho de envio de foto mudou');
product=product.replace(uploadMarker,'let{path:i,error:o}=await window.autobarUploadPhoto(r.blob,r.contentType);').replace('r=await t(e,1600,.82)','r=await t(e,1200,.72)');
if(!product.includes('Pix e cartão em até 12x.'))throw Error('Texto de pagamento do produto mudou');
product=product.replace('Pix e cartão em até 12x.','Pagamento via Pix.');
const autobarTier='if(n&&n.offer_mode===`kit2`){let e=n.price,t=n.compare_at_price&&n.compare_at_price>e?n.compare_at_price:Math.round(e*1.63),r=n.name.split(` `)[0];return[{id:1,quantity:1,price:e,compareAtPrice:t,label:`1 ${r}`},{id:2,quantity:2,price:Math.round(e*1.8),compareAtPrice:t*2,label:`2 ${r}`,badge:`Melhor Preço`}]}';
if(!product.includes(autobarTier))throw Error('Cálculo da segunda oferta mudou');
product=product.replace(autobarTier,autobarTier.replace('price:Math.round(e*1.8)','price:n.slug===`autobar`?11900:Math.round(e*1.8)'));
if(!product.includes('We(`/checkout`);return'))throw Error('Navegação do produto ao checkout mudou');
product=product.replace('We(`/checkout`);return','location.assign(`/checkout`);return');
const brandState='i(t)';
if(product.split(brandState).length!==3)throw Error('Estado do produto mudou');
product=product.replaceAll(brandState,'i(__gelabarBrand(t))');
product+='\nfunction __gelabarBrand(value){return value?.slug===`autobar`?JSON.parse(JSON.stringify(value).replaceAll(`AutoBar`,`GelaBar`).replaceAll(`fd5d694cc3f25a88.webp`,`gelabar-gallery-1.jpg`).replaceAll(`66165014bfa0c775.webp`,`gelabar-gallery-2.jpg`).replaceAll(`a1e9bde41cf61aa9.webp`,`gelabar-thumb.jpg`)):value}\n';
await fs.writeFile(productBundle,product);
const headerBundle=path.join(out,'assets','Header-yU5vQPS8.js');
let header=await fs.readFile(headerBundle,'utf8');
for(const [before,after] of [['o=i.logo,c=n(i.logo_size)','o=`/brand/gelabar-logo.svg`,c=n(i.logo_size)'],['T=v(i)','T=`GelaBar`']]){if(!header.includes(before))throw Error('Cabeçalho mudou');header=header.replace(before,after)}
await fs.writeFile(headerBundle,header);
const checkoutBundle=path.join(out,'assets','checkout-C2qFdlwJ.js');
let checkout=await fs.readFile(checkoutBundle,'utf8');
const phoneGuard='if(Le===`required`&&!z.trim()){S.error(`Preencha o celular / WhatsApp`);return}';
if(!checkout.includes(phoneGuard))throw Error('Validação do telefone mudou no checkout');
checkout=checkout.replace(phoneGuard,phoneGuard+'if(z.trim()&&!/^(?:1[1-9]|2[12478]|3[1-578]|4[1-9]|5[1345]|6[1-9]|7[134579]|8[1-9]|9[1-9])(?:[2-5]\\d{7}|9\\d{8})$/.test(z.replace(/\\D/g,``))){S.error(`Digite um celular ou telefone válido com DDD`);return}');
const nameGuard='if(!I.trim()){S.error(`Preencha o nome completo`);return}';
const zipGuard='if(!B.trim()){S.error(`Preencha o CEP`);return}';
const numberGuard='if(!nt.trim()){S.error(`Preencha o número da casa`);return}';
for(const marker of [nameGuard,zipGuard,numberGuard])if(!checkout.includes(marker))throw Error('Validação de identificação ou entrega mudou no checkout');
checkout=checkout.replace(nameGuard,nameGuard+'if(I.trim().split(/\\s+/).length<2){S.error(`Digite nome e sobrenome`);return}');
checkout=checkout.replace(zipGuard,zipGuard+'if(!/^\\d{8}$/.test(B.replace(/\\D/g,``))){S.error(`Digite um CEP válido`);return}');
checkout=checkout.replace(numberGuard,numberGuard+'if(!/^\\d{1,10}$/.test(nt.trim())||Number(nt)<1){S.error(`Digite um número de endereço válido`);return}');
checkout=checkout.replace('KIDS10:{pct:10},TESTE777:{pct:95}','KIDS10:{pct:10}');
checkout=checkout.replace('k=b(`pay_card`)','k=!1');
if(!checkout.includes('5% de cashback')||!checkout.includes(' para a próxima compra'))throw Error('Texto do checkout mudou');
checkout=checkout.replace('5% de cashback','Pagamento via Pix').replace(' para a próxima compra',' com confirmação automática');
const pixDiscount='J=W===`pix`&&j===3?Math.round(c*.05):0';
if(!checkout.includes(pixDiscount))throw Error('Cálculo do desconto Pix mudou');
checkout=checkout.replace(pixDiscount,'J=0').replace('b(`pix_badge`)&&(0,w.jsx)','!1&&(0,w.jsx)');
await fs.writeFile(checkoutBundle,checkout);
const cartBundle=path.join(out,'assets','index-DCpKv0un.js');
let cart=await fs.readFile(cartBundle,'utf8');
for(const [before,after] of [
  ['function _p(e,t){return t>=3?Math.round(e*2.5):t===2?Math.round(e*1.8):e}','function _p(e,t){return e===7900&&t===2?11900:t>=3?Math.round(e*2.5):t===2?Math.round(e*1.8):e}'],
  ['let r=Number(t.price)||e.price','let r=e.slug===`autobar`?7900:Number(t.price)||e.price'],
  ['Math.min(3,Math.max(1,r))','Math.min(n.slug===`autobar`?2:3,Math.max(1,r))']
]){
  if(!cart.includes(before))throw Error('Cálculo do carrinho mudou');
  cart=cart.replace(before,after);
}
const cartThumb='let n=t.checkout_image_url||null';
if(!cart.includes(cartThumb))throw Error('Miniatura do carrinho mudou');
cart=cart.replace(cartThumb,'let n=e.slug===`autobar`?`/media/gelabar-thumb.jpg`:t.checkout_image_url||null');
await fs.writeFile(cartBundle,cart);
const footerBundle=path.join(out,'assets','Footer-CXUy4S6e.js');
let footer=await fs.readFile(footerBundle,'utf8');
for(const [before,after] of [['t=e.logo_white||e.logo,i=f(e)','t=`/brand/gelabar-logo-white.svg`,i=`GelaBar`']]){if(!footer.includes(before))throw Error('Logo do rodapé mudou');footer=footer.replace(before,after)}
for(const [before,after] of [['Diversão, conforto e segurança.','Praticidade para sua viagem.'],['Receba ofertas exclusivas, novidades e dicas para a criançada assinando nossa newsletter.','Receba novidades e ofertas exclusivas da Central Ideal.']]){
  if(!footer.includes(before))throw Error('Texto do rodapé mudou');
  footer=footer.replace(before,after);
}
await fs.writeFile(footerBundle,footer);
const trackingBundle=path.join(out,'assets','rastreio-DIZAdoen.js');
let tracking=await fs.readFile(trackingBundle,'utf8');
const trackingCall='await a.rpc(`lookup_tracking`,{q:n})';
if(!tracking.includes(trackingCall))throw Error('Busca de rastreio mudou');
tracking=tracking.replace(trackingCall,'await window.autobarLookupTracking(n)');
const timelineStart=tracking.indexOf('function A(e){'),timelineEnd=tracking.indexOf('function j(){',timelineStart);
if(timelineStart<0||timelineEnd<0)throw Error('Linha do tempo mudou');
const timeline='function A(e){const steps=[{icon:(0,T.jsx)(m,{className:`h-5 w-5`}),title:`Pedido recebido`,desc:`Seu pedido foi registrado.`,date:e.created_at,done:!0},{icon:(0,T.jsx)(c,{className:`h-5 w-5`}),title:`Pagamento confirmado`,desc:e.paid_at?`Pagamento aprovado.`:`Aguardando confirmação do pagamento.`,date:e.paid_at,done:!!e.paid_at}];if(!e.paid_at)return steps;steps.push({icon:(0,T.jsx)(y,{className:`h-5 w-5`}),title:`Em preparação`,desc:`Pedido em preparação.`,done:[`em_preparacao`,`enviado`,`entregue`].includes(e.fulfillment_status)});if([`enviado`,`entregue`].includes(e.fulfillment_status))steps.push({icon:(0,T.jsx)(h,{className:`h-5 w-5`}),title:`Enviado`,desc:`Encomenda enviada.`,done:!0});if(e.fulfillment_status===`entregue`)steps.push({icon:(0,T.jsx)(l,{className:`h-5 w-5`}),title:`Entregue`,desc:`Entrega concluída.`,done:!0});return steps}';
tracking=tracking.slice(0,timelineStart)+timeline+tracking.slice(timelineEnd);
tracking=tracking.replace('Pedidos são despachados no dia seguinte à compra, às 9h32.','Acompanhe o status informado pela loja.').replace('Confira o código, CPF ou telefone e tente novamente.','Confira o código do pedido ou de rastreio e tente novamente.').replace('placeholder:`Buscar meu pedido`','placeholder:`Código do pedido ou de rastreio`');
await fs.writeFile(trackingBundle,tracking);
console.log('Arquivos estáticos prontos em public/');
