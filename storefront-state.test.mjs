import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {normalizeStoredCart, readStoredCart} from './storefront-state.js';
import {pickerContent} from './storefront-build.mjs';
import {addProductToCart} from './product-cart.js';

test('invalid persisted carts cannot enter the product render', () => {
  for (const value of [null, {}, 'cart', 123, [null], [{price:79}]]) {
    assert.deepEqual(normalizeStoredCart(value), []);
  }
  assert.deepEqual(readStoredCart({getItem:()=>'{invalid'}), []);
  assert.deepEqual(readStoredCart({getItem(){throw Error('Storage denied')}}), []);
});

test('valid GelaBar and AgroBar selections survive malformed neighboring rows', () => {
  const rows = [
    {id:'car',slug:'autobar',price:11900,quantity:1,kitQty:2,customization:{station:'Shell'}},
    {id:'agro',slug:'agrobar',price:7900,quantity:1,customization:{name:'Kaio'}},
  ];
  assert.deepEqual(normalizeStoredCart([null,...rows,{id:'bad',slug:'autobar',price:NaN,quantity:1}]), rows);
});

test('published product owns one selector and a complete local catalog', async () => {
  const html = await fs.readFile(new URL('./public/produto/autobar/index.html',import.meta.url),'utf8');
  assert.equal(html.split('id="gelabar-variant-switch"').length-1,1);
  assert.ok(html.includes(pickerContent));
  const product=JSON.parse(html.match(/<script id="gelabar-product-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(product.slug,'autobar');
  assert.equal(product.price,7900);
  assert.ok(html.includes('/brand/gelabar-logo.svg'));
  assert.ok(product.customization.station.options.length);
  assert.doesNotMatch(html, /\$_TSR|modulepreload|src="\/assets\/.*\.js"/);
  assert.match(html,/src="\/product-page-[a-f0-9]{12}\.js"/);
  assert.equal((html.match(/data-kit=/g)||[]).length,2);
  assert.equal((html.match(/data-station=/g)||[]).length,5);
});

test('native product cart preserves price, customization and checkout contract', () => {
  const product={id:'car',slug:'autobar',name:'GelaBar',customization:{station:{options:[{name:'Shell',image:'/shell.webp'}]}}};
  let value='[null,{"bad":true}]';
  const storage={getItem:()=>value,setItem:(key,next)=>{assert.equal(key,'store:cart');value=next;}};
  assert.throws(()=>addProductToCart(storage,product,{station:'invalid'}),/Escolha o posto/);
  let items=addProductToCart(storage,product,{station:'Shell',kit:1});
  assert.equal(items[0].price,7900);
  items=addProductToCart(storage,product,{station:'Shell',kit:2,photoPath:'vehicle-photos/example.jpg',buyNow:true});
  assert.equal(items[1].price,11900);
  assert.equal(items[1].kitQty,2);
  assert.equal(items[1].customization.photoPath,'vehicle-photos/example.jpg');
  assert.equal(items[1].customization.station,'Shell');
  assert.equal(items[1].buyNow,true);
  assert.equal(items[1].units.length,2);
  assert.throws(()=>addProductToCart({getItem:()=>null,setItem(){throw Error('QuotaExceededError')}},product,{station:'Shell'}),/Não foi possível salvar/);
});
