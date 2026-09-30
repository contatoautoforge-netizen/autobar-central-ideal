import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
for (const route of ['produto/autobar', 'checkout', 'politicas', 'rastreio']) {
  const file = path.join(root, route, 'index.html');
  let html = await fs.readFile(file, 'utf8');
  html = html.replace(/<script defer src="\/~flock\.js"[^>]*><\/script>/g, '');
  html = html.replaceAll('home_px_utmify_enabled:"1"', 'home_px_utmify_enabled:"0"');
  if (!html.includes('http-equiv="Content-Security-Policy"')) {
    const policy = "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; font-src 'self' data:; connect-src 'self'; form-action 'self'";
    html = html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${policy}"/>`);
  }
  await fs.writeFile(file, html);
}

// The source storefront bundles production pixels. Keep the replicated UI local
// without recording test visits or purchase intent in the live store's analytics.
const entry = path.join(root, 'assets', 'index-DCpKv0un.js');
let bundle = await fs.readFile(entry, 'utf8');
const start = bundle.indexOf('function $g()');
const end = bundle.indexOf('var e_=', start);
if (start >= 0 && end >= 0) {
  bundle = bundle.slice(0, start) + 'function $g(){return null}' + bundle.slice(end);
} else if (!bundle.includes('function $g(){return null}')) {
  throw new Error('Bloco de analytics não encontrado');
}
await fs.writeFile(entry, bundle);

const tracker = path.join(root, 'assets', 'metaPixel-MaLX4pWF.js');
await fs.writeFile(tracker, `const noop=async()=>{};
const n={pageView:noop,viewContent:noop,addToCart:noop,initiateCheckout:noop,addPaymentInfo:noop,purchase:noop,lead:noop};
const t={getAdSignals:()=>({}),initMetaPixels:async()=>[],initTiktokPixels:async()=>[],metaTrack:n,trackMetaEvent:noop};
export{n,t};\n`);

const product = path.join(root, 'assets', 'produto._slug-BeuPeFaD.js');
let productBundle = await fs.readFile(product, 'utf8');
productBundle = productBundle.replace('await l.storage.from(m).upload(i,r.blob,{contentType:r.contentType,upsert:!1})', '{error:null}');
await fs.writeFile(product, productBundle);
