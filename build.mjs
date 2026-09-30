import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'public');
if (!out.startsWith(root + path.sep)) throw new Error('Diretório de saída inválido');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

for (const name of ['assets', 'media', 'produto', 'checkout', 'pagamento-pix', 'politicas', 'rastreio']) {
  await fs.cp(path.join(root, name), path.join(out, name), { recursive: true });
}
for (const name of ['favicon.png', 'apple-touch-icon.png', 'site.webmanifest', 'checkout-notice.js', 'checkout-bridge.js', 'marketing.js', 'pix.js']) {
  await fs.copyFile(path.join(root, name), path.join(out, name));
}

for (const route of ['produto/autobar', 'checkout', 'politicas', 'rastreio']) {
  const page = path.join(out, route, 'index.html');
  let html = await fs.readFile(page, 'utf8');
  html = html.replace("connect-src 'self'", "connect-src 'self' https://personalizecar.vercel.app");
  html = html.replace("script-src 'self' 'unsafe-inline'", "script-src 'self' 'unsafe-inline' https://analytics.tiktok.com https://connect.facebook.net https://cdn.utmify.com.br");
  html = html.replace("connect-src 'self' https://personalizecar.vercel.app", "connect-src 'self' https://personalizecar.vercel.app https://analytics.tiktok.com https://*.tiktok.com https://www.facebook.com https://cdn.utmify.com.br");
  html = html.replace('<strong class="text-neutral-600">5% de cashback</strong> para a próxima compra','<strong class="text-neutral-600">Pagamento via Pix</strong> com confirmação automática');
  html = html.replace('Diversão, conforto e segurança.','Praticidade para sua viagem.').replace('Receba ofertas exclusivas, novidades e dicas para a criançada assinando nossa newsletter.','Receba novidades e ofertas exclusivas da Central Ideal.');
  html = html.replace('Brincar é coisa séria. Na <strong class="font-bold text-white">Central Ideal</strong>, criamos produtos que unem <strong class="font-bold text-white">segurança</strong>, qualidade e aquela dose de diversão que faz cada dia virar memória de infância.','Na <strong class="font-bold text-white">Central Ideal</strong>, criamos produtos práticos para acompanhar seus momentos na estrada.');
  html = html.replace(/<div class="mt-8 flex flex-wrap items-center gap-2"><img[^]*?<\/div>/,'<div class="mt-8 flex flex-wrap items-center gap-2"><span class="rounded bg-white px-4 py-2 text-sm font-bold text-neutral-800">Pix</span></div>');
  html = html.replace('</head>', '<script src="https://cdn.utmify.com.br/scripts/utms/latest.js" data-utmify-prevent-xcod-sck data-utmify-prevent-subids async defer></script><script src="/checkout-bridge.js"></script><script defer src="/marketing.js"></script><script defer src="/checkout-notice.js"></script></head>');
  await fs.writeFile(page, html);
}
{
  const page=path.join(out,'pagamento-pix','index.html');let html=await fs.readFile(page,'utf8');
  html=html.replace("script-src 'self'", "script-src 'self' https://analytics.tiktok.com https://connect.facebook.net https://cdn.utmify.com.br").replace("img-src 'self' data:","img-src 'self' data: https:").replace("connect-src 'self' https://personalizecar.vercel.app", "connect-src 'self' https://personalizecar.vercel.app https://analytics.tiktok.com https://*.tiktok.com https://www.facebook.com https://cdn.utmify.com.br");
  html=html.replace('</head>','<script src="https://cdn.utmify.com.br/scripts/utms/latest.js" data-utmify-prevent-xcod-sck data-utmify-prevent-subids async defer></script><script defer src="/marketing.js"></script></head>');await fs.writeFile(page,html);
}
const productBundle=path.join(out,'assets','produto._slug-BeuPeFaD.js');
let product=await fs.readFile(productBundle,'utf8');
const uploadMarker='let i=`vehicle-photos/${crypto.randomUUID()}.${r.extension}`,{error:o}={error:null};';
if(!product.includes(uploadMarker))throw Error('Trecho de envio de foto mudou');
product=product.replace(uploadMarker,'let{path:i,error:o}=await window.autobarUploadPhoto(r.blob,r.contentType);').replace('r=await t(e,1600,.82)','r=await t(e,1200,.72)');
await fs.writeFile(productBundle,product);
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
await fs.writeFile(checkoutBundle,checkout);
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
