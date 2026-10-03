import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

export const pickerContent = '<div class="model-picker__heading"><strong>Escolha o modelo</strong><span>Selecione a versão que combina com você</span></div><div class="model-picker__grid"><a class="model-picker__option" href="/produto/autobar" aria-current="page"><img src="/media/gelabar-thumb.jpg" alt=""><span class="model-picker__copy"><strong>GelaBar</strong><small>Carro + posto</small></span><span class="model-picker__check" aria-hidden="true">✓</span></a><a class="model-picker__option" href="/produto/agrobar"><img src="/media/agrobar-1.webp" alt=""><span class="model-picker__copy"><strong>AgroBar</strong><small>Colheitadeira</small></span><span class="model-picker__check" aria-hidden="true">✓</span></a></div>';

function replaceOnce(source, before, after, label) {
  if (source.split(before).length !== 2) throw Error(`Trecho de ${label} mudou`);
  return source.replace(before, after);
}

export function extractStoreData(html) {
  const stream = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map(match => match[1]).find(script => script.includes('$_TSR.router='));
  if (!stream) throw Error('Dados locais do produto ausentes');
  const context = {document:{currentScript:{remove(){}}}};
  context.self = context;
  vm.runInNewContext(stream, context, {timeout:1000});
  const matches = context.$_TSR.router.matches;
  const settings = matches.find(match => match.l?.settings)?.l.settings;
  const product = matches.find(match => match.l?.slug === 'autobar')?.l;
  if (!settings || product?.price !== 7900) throw Error('Catálogo local inválido');
  return JSON.parse(JSON.stringify({settings, product}));
}

export async function stabilizeStorefront(out) {
  const page = path.join(out, 'produto/autobar/index.html');
  let html = await fs.readFile(page, 'utf8');
  const {settings, product} = extractStoreData(html);
  const picker = `<nav id="gelabar-variant-switch" class="model-picker" aria-label="Escolha o modelo do produto">${pickerContent}</nav>`;
  html = replaceOnce(html, '<h1 ', picker + '<h1 ', 'seletor renderizado');
  await fs.writeFile(page, html);

  const productFile = path.join(out, 'assets/produto._slug-BeuPeFaD.js');
  let productCode = await fs.readFile(productFile, 'utf8');
  const heading = '(0,T.jsx)(`h1`,{className:`text-[26px] md:text-[34px] font-extrabold leading-[1.15] tracking-tight text-[#111111]`,children:n.name})';
  const reactPicker = '(0,T.jsx)(`nav`,{id:`gelabar-variant-switch`,className:`model-picker`,"aria-label":`Escolha o modelo do produto`,dangerouslySetInnerHTML:{__html:' + JSON.stringify(pickerContent) + '}})';
  productCode = replaceOnce(productCode, heading, reactPicker + ',' + heading, 'seletor React');
  await fs.writeFile(productFile, productCode);

  const entryFile = path.join(out, 'assets/index-DCpKv0un.js');
  let entry = await fs.readFile(entryFile, 'utf8');
  entry = replaceOnce(entry,
    'var e_=ho({method:`GET`}).handler(_a(`a29f7971a0eceb6db656d02cc8ae1c14ded3a73a1eb82db0852267ae2a620d4c`))',
    'var e_=async()=>__gelabarSettings', 'configuração da loja');
  entry = replaceOnce(entry,
    'async function nv(e){let{data:t,error:n}=await M.from(`products`).select(tv).eq(`slug`,e).eq(`active`,!0).maybeSingle();return n&&console.error(n),t??null}',
    'async function nv(e){return e===`autobar`?__gelabarProduct:null}', 'catálogo da loja');
  entry = replaceOnce(entry, 'e&&n(JSON.parse(e))', 'e&&n(__normalizeStoredCart(JSON.parse(e)))', 'recuperação do carrinho');
  entry = entry.replaceAll('This page didn\'t load','Não foi possível abrir esta página')
    .replaceAll('Something went wrong on our end. You can try refreshing or head back home.','Tente abrir a loja novamente. Seu carrinho será preservado.')
    .replaceAll('children:`Try again`','children:`Abrir a loja`')
    .replaceAll('children:`Go home`','children:`Voltar à loja`');
  entry = replaceOnce(entry, 'onClick:()=>{n.invalidate(),t()}', 'onClick:()=>location.assign(`/produto/autobar`+location.search)', 'recuperação da página');
  entry = 'import {normalizeStoredCart as __normalizeStoredCart} from "../storefront-state.js";\n'
    + `const __gelabarSettings=${JSON.stringify(settings)},__gelabarProduct=${JSON.stringify(product)};\n` + entry;
  await fs.writeFile(entryFile, entry);
}
