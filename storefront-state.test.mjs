import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {normalizeStoredCart, readStoredCart} from './storefront-state.js';
import {extractStoreData, pickerContent} from './storefront-build.mjs';

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
  const {product,settings}=extractStoreData(html);
  assert.equal(product.slug,'autobar');
  assert.equal(product.price,7900);
  assert.ok(settings.logo.includes('gelabar'));
  assert.ok(product.customization.station.options.length);
});
