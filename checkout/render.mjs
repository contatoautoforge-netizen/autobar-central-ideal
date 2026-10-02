import fs from 'node:fs/promises';
import path from 'node:path';

export async function renderAutobarCheckout(root){
  let html=await fs.readFile(path.join(root,'checkout','gelacar-template.html'),'utf8');
  const replace=(before,after)=>{
    if(!html.includes(before))throw Error(`Checkout de referência mudou: ${before.slice(0,80)}`);
    html=html.replaceAll(before,after);
  };
  replace('Checkout | IcedCar','Checkout | GelaBar — Central Ideal');
  replace('/brand/icedcar-favicon.svg','/brand/gelabar-favicon.png');
  replace('/assets/styles-AmZeijte.css','/checkout/gelacar-base.css');
  replace('/checkout/checkout.js','/checkout/autobar-checkout.js');
  replace('/brand/icedcar-logo.svg','/brand/gelabar-logo.svg');
  replace('/brand/pix-logo.png','/checkout/brand/pix-logo.png');
  replace('/brand/pac-correios.png','/checkout/brand/pac-correios.png');
  replace('/brand/sedex-correios.png','/checkout/brand/sedex-correios.png');
  replace('<strong>5% de cashback</strong> para a próxima compra','<strong>Pagamento via Pix</strong> com confirmação automática');
  replace('A Kirvus Pay ainda não está configurada para receber pedidos nesta loja. Nenhuma cobrança será criada.','O pagamento via Pix está temporariamente indisponível. Tente novamente em instantes.');
  replace('<img src="/brand/icedcar-logo-white.svg" alt="IcedCar" width="600" height="200" loading="lazy" decoding="async" class="h-10 w-auto object-contain"/>','<img src="/brand/gelabar-logo-white.svg" alt="GelaBar" width="600" height="200" loading="lazy" decoding="async" class="h-10 w-auto object-contain"/>');
  replace('Seu carro, sua resenha.','Seu carro. Seu posto. Seu GelaBar.');
  replace('Receba novidades e ofertas da IcedCar no seu e-mail.','Receba novidades e ofertas da Central Ideal no seu e-mail.');
  replace('Na <strong class="font-bold text-white">IcedCar</strong>, criamos coolers que unem','Na <strong class="font-bold text-white">Central Ideal</strong>, criamos produtos que unem');
  replace('IcedCar','GelaBar');
  replace('CHECKOUT EM CONFIGURAÇÃO','PAGAMENTO SEGURO VIA PIX');
  replace('href="/"','href="/produto/autobar"');
  replace('href="/produtos"','href="/produto/autobar"');
  replace('href="#avaliacoes"','href="/produto/autobar#avaliacoes"');
  replace('href="#faq"','href="/produto/autobar#faq"');
  const reviews=[
    ['Rafael Cardoso','Quando chegou fiquei impressionado com os detalhes. Mandei as fotos do meu carro e fizeram...','/media/3a3b3852642727dc.webp'],
    ['Gustavo Alves','Ficou top demais. A BMW ficou muito parecida com a minha e ainda coloquei o posto Shell.','/media/9e49a7682f7a3963.webp'],
    ['Mateus Ribeiro','Tenho um Gol e quando vi que dava para fazer com o meu carro já quis na hora.','/media/557355cd1db0b707.webp'],
    ['Gustavo Sardanha','Peguei com o Clio porque foi meu primeiro carro e queria guardar essa lembrança.','/media/ced3f4d9576754df.webp']
  ];
  const cards=reviews.map(([name,quote,image])=>`<article class="checkout-review-card"><img src="${image}" alt="" loading="lazy" decoding="async"><div class="checkout-review-copy"><span class="checkout-review-stars" aria-label="5 estrelas">★★★★★</span><strong>${name}</strong><p>${quote}</p></div></article>`).join('');
  replace('<!-- checkout-reviews -->',`<section class="checkout-reviews" aria-label="Avaliações de clientes"><h2>Avaliações de clientes</h2><div class="checkout-review-viewport"><div class="checkout-review-track"><div class="checkout-review-set">${cards}</div><div class="checkout-review-set" aria-hidden="true">${cards}</div></div></div></section>`);
  replace('</head>','<link rel="stylesheet" href="/checkout/autobar.css"><script src="/checkout-bridge.js"></script><script defer src="/marketing.js"></script><script src="https://cdn.utmify.com.br/scripts/utms/latest.js" data-utmify-prevent-xcod-sck data-utmify-prevent-subids async defer></script></head>');
  return html;
}
