import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export async function renderStaticProduct(html, product, settings, out) {
  // Keep the original rendered layout, but never execute the copied application's
  // router/hydration stream. It depends on a server which this static store lacks.
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, tag => {
    if (tag.includes('application/ld+json') || /src="(?:https:\/\/cdn\.utmify\.com\.br\/|\/(?:checkout-bridge|marketing|variant-switch)\.js)/.test(tag)) return tag;
    return '';
  }).replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g,'').replace(/<!--[^]*?-->/g,'').replaceAll('\0','');
  html = html.replace(/<link\b[^>]*(?:ysinsqbpzkriegpslvti|9781db6e267de09f|29d70dbc95645dfc)[^>]*>/g,'');
  let galleryIndex = 0;
  html = html.replace(/<button\b[^>]*>[\s\S]*?<\/button>/g, button => {
    const text = button.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
    const option = product.customization.station.options.find(option => option.name === text);
    let attributes = '';
    if (option) attributes = `data-station="${escape(option.name)}" aria-pressed="false"`;
    else if (/^[12] GelaBar/.test(text)) attributes = `data-kit="${text[0]}" aria-pressed="${text[0] === '1'}"`;
    else if (text === 'Comprar agora') attributes = 'data-buy';
    else if (text === 'Adicionar ao carrinho') attributes = 'data-add';
    else if (text.startsWith('Envie uma foto')) attributes = 'data-upload';
    else if (/^\d+ avaliações$/.test(text)) attributes = 'data-reviews';
    else if (text === 'Informações do envio' || text === 'Trocas e devoluções') attributes = `data-accordion aria-controls="${text === 'Informações do envio' ? 'product-shipping' : 'product-returns'}"`;
    else if (button.includes('<img') && !text) attributes = `data-gallery-index="${galleryIndex}" aria-label="Ver foto ${galleryIndex+1}" aria-pressed="${galleryIndex++ === 0}"`;
    // These controls never had handlers or a submission API in the source.
    else if (text === 'Mostrar mais' || text === 'Escrever minha avaliação') return '';
    return attributes ? button.replace('<button ',`<button ${attributes} `) : button;
  });
  html = html.replace('<div class="flex w-full snap-x', '<div data-gallery class="flex w-full snap-x');
  let dot = 0;
  html = html.replace(/<div class="h-1\.5 rounded-full transition-all duration-300 [^"]*">/g, () => `<div data-gallery-dot class="product-gallery-dot${dot++ === 0 ? ' is-current' : ''}">`);
  html = html.replace(/<p[^>]*>Você economiza[\s\S]*?<\/p>/, '<p id="product-saving" class="mt-3 text-center text-sm">Você economiza R$ 221,00 nesta compra</p>');
  if (!html.includes('id="product-saving"')) throw Error('Texto de economia não encontrado');
  html = html.replace('data-add ', 'id="product-add" data-add ');
  html = html.replace(/(<button id="product-add"[\s\S]*?<\/button>)/, '$1<p id="product-message" role="status" aria-live="polite" class="product-message"></p>');
  html = html.replace(/(<button data-upload[\s\S]*?<\/button>)/, '$1<p id="product-photo-status" role="status"></p><img id="product-photo-preview" hidden alt="Prévia da foto do seu carro" width="120"><button type="button" id="product-photo-remove" hidden>Remover foto</button>');
  const panels = [
    ['product-shipping',settings.pdp_ship_text || 'Enviamos para todo o Brasil. Consulte os prazos e as opções de frete no checkout. Você receberá o código de rastreio após o envio.'],
    ['product-returns',settings.pdp_returns_text || 'Você pode solicitar troca ou devolução em até 7 dias após o recebimento. Consulte nossa política de trocas e devoluções.'],
  ];
  let panelIndex = 0;
  html = html.replace(/<div data-state="closed"[^>]*role="region"[^>]*><\/div>/g, () => {
    const [id,text] = panels[panelIndex++]; return `<div id="${id}" hidden class="product-accordion">${escape(text)}</div>`;
  });
  if (panelIndex !== 2 || galleryIndex !== 4) throw Error('Estrutura de galeria ou informações mudou');
  html = html.replace('<section class="mt-8 max-w-3xl', '<section id="product-reviews" class="mt-8 max-w-3xl');
  html = html.replace('<section id="product-reviews"', '<span id="avaliacoes"></span><section id="product-reviews"');
  html = html.replace('<div id="product-shipping"', '<span id="faq"></span><div id="product-shipping"');
  html = html.replaceAll('<div style="min-height:320px"></div>','');
  html = html.replace('<div style="min-height:400px"></div>', '<footer class="product-footer"><img src="/brand/gelabar-logo-white.svg" alt="GelaBar" width="160"><p>Seu momento de lazer com personalidade.</p><nav><a href="/produto/autobar">GelaBar</a><a href="/produto/agrobar">AgroBar</a><a href="/rastreio">Rastrear pedido</a><a href="/politicas">Políticas da loja</a></nav><p>Pagamento seguro via Pix.</p></footer>');
  html = html.replace('aria-label="Abrir carrinho">','aria-label="Abrir carrinho"><span id="product-cart-count" class="product-cart-count">0</span>');
  html = html.replace('aria-label="Abrir menu"','aria-label="Abrir menu" aria-expanded="false" aria-controls="product-menu"');
  html = html.replace('</header>', '</header><nav id="product-menu" hidden class="product-menu" aria-label="Navegação da loja"><a href="/produto/autobar">GelaBar</a><a href="/produto/agrobar">AgroBar</a><a href="/rastreio">Rastrear pedido</a><a href="/politicas">Políticas da loja</a></nav>');
  html = html.replace('</body>', `<div id="product-cart" hidden class="product-cart-overlay" role="dialog" aria-modal="true" aria-labelledby="product-cart-title"><div class="product-cart-panel"><button type="button" data-close-cart aria-label="Fechar carrinho">Fechar ×</button><h2 id="product-cart-title">Seu carrinho</h2><div id="product-cart-items"></div><p class="product-cart-total">Subtotal <strong id="product-cart-total"></strong></p><a id="product-cart-checkout" class="product-primary" href="/checkout">Finalizar compra</a><button type="button" data-close-cart>Continuar comprando</button></div></div><script id="gelabar-product-data" type="application/json">${JSON.stringify(product).replaceAll('<','\\u003c')}</script></body>`);
  let code = '';
  for (const name of ['storefront-state.js','product-cart.js','product-page.js']) {
    code += (await fs.readFile(new URL(name,import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replaceAll('export function ','function ') + '\n';
  }
  const revision = createHash('sha256').update(code).digest('hex').slice(0,12);
  await fs.writeFile(path.join(out,`product-page-${revision}.js`),code);
  const css = await fs.readFile(new URL('product-page.css',import.meta.url),'utf8');
  const cssRevision = createHash('sha256').update(css).digest('hex').slice(0,12);
  await fs.writeFile(path.join(out,`product-page-${cssRevision}.css`),css);
  html = html.replace('</head>',`<link rel="stylesheet" href="/product-page-${cssRevision}.css"><script defer src="/product-page-${revision}.js"></script><noscript><style>.pdp-fade-in{opacity:1}</style></noscript></head>`);
  return html;
}
