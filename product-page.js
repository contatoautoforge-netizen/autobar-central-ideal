import {readStoredCart} from './storefront-state.js';
import {addProductToCart} from './product-cart.js';

// Enhance the already rendered page. No router, hydration or remote catalog is
// needed to display the product, and a failed optional integration cannot hide it.
(() => {
  const product = JSON.parse(document.getElementById('gelabar-product-data').textContent);
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  let station = '', kit = 1, photoPath = '', uploading = false, uploadRevision = 0;
  const message = $('#product-message');
  const money = cents => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL'}).format(cents / 100);
  function tell(text) { message.textContent = text; message.scrollIntoView({block:'nearest',behavior:'smooth'}); }
  function cart() { try { return readStoredCart(localStorage); } catch { return []; } }
  function count() { $('#product-cart-count').textContent = String(cart().reduce((n,item) => n + item.quantity * (item.kitQty === 2 ? 2 : 1), 0)); }
  all('[data-station]').forEach(button => button.addEventListener('click', () => {
    station = button.dataset.station;
    all('[data-station]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    message.textContent = '';
  }));
  all('[data-kit]').forEach(button => button.addEventListener('click', () => {
    kit = Number(button.dataset.kit);
    all('[data-kit]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    $('#product-saving').textContent = `Você economiza ${money(kit === 2 ? 48100 : 22100)} nesta compra`;
  }));
  function add(buyNow) {
    if (uploading) { tell('Aguarde o envio da foto terminar.'); return; }
    try { addProductToCart(localStorage, product, {station,photoPath,kit,buyNow}); }
    catch (error) { tell(error.message); return; }
    count();
    // Publish the event after a successful cart write and before navigation.
    document.dispatchEvent(new CustomEvent('gelabar:cart-added', {detail:{value:kit === 2 ? 119 : 79}}));
    if (buyNow) location.assign('/checkout');
    else openCart();
  }
  $('[data-buy]').addEventListener('click', () => add(true));
  $('[data-add]').addEventListener('click', () => add(false));
  const gallery = $('[data-gallery]');
  const thumbs = all('[data-gallery-index]');
  thumbs.forEach(button => button.addEventListener('click', () => gallery.scrollTo({left:Number(button.dataset.galleryIndex)*gallery.clientWidth,behavior:'smooth'})));
  gallery.addEventListener('scroll', () => {
    const index = Math.round(gallery.scrollLeft / gallery.clientWidth);
    thumbs.forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
    all('[data-gallery-dot]').forEach((dot,i) => dot.classList.toggle('is-current',i === index));
  }, {passive:true});
  all('[data-accordion]').forEach(button => button.addEventListener('click', () => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded',String(open)); button.dataset.state = open ? 'open' : 'closed'; panel.hidden = !open;
  }));
  $('[data-reviews]').addEventListener('click', () => $('#product-reviews').scrollIntoView({behavior:'smooth',block:'start'}));
  const menu = $('#product-menu');
  $('[aria-label="Abrir menu"]').addEventListener('click', event => { menu.hidden = !menu.hidden; event.currentTarget.setAttribute('aria-expanded',String(!menu.hidden)); });
  let previousFocus;
  const drawer = $('#product-cart');
  function closeCart() { drawer.hidden = true; document.body.style.overflow = ''; previousFocus?.focus(); }
  function openCart() {
    const list = $('#product-cart-items'); list.replaceChildren();
    const items = cart();
    if (!items.length) { const empty = document.createElement('p'); empty.textContent = 'Seu carrinho está vazio.'; list.append(empty); }
    items.forEach((item,index) => {
      const row = document.createElement('div'); row.className = 'product-cart-row';
      const img = document.createElement('img'); img.src = item.slug === 'agrobar' ? '/media/agrobar-1.webp' : '/media/gelabar-thumb.jpg'; img.alt = '';
      const text = document.createElement('p'); text.textContent = `${item.name} · ${item.size || ''} · Quantidade: ${item.quantity} · ${money(item.price*item.quantity)}`;
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remover'; remove.setAttribute('aria-label',`Remover ${item.slug === 'agrobar' ? 'AgroBar' : 'GelaBar'}`);
      remove.addEventListener('click', () => { try { items.splice(index,1); localStorage.setItem('store:cart',JSON.stringify(items)); count(); openCart(); } catch { tell('Não foi possível atualizar o carrinho.'); } });
      row.append(img,text,remove); list.append(row);
    });
    $('#product-cart-total').textContent = money(items.reduce((total,item) => total + item.price*item.quantity,0));
    $('#product-cart-checkout').hidden = !items.length;
    if (drawer.hidden) previousFocus = document.activeElement;
    drawer.hidden = false; document.body.style.overflow = 'hidden'; $('[data-close-cart]').focus();
  }
  $('[aria-label="Abrir carrinho"]').addEventListener('click',openCart);
  all('[data-close-cart]').forEach(button => button.addEventListener('click',closeCart));
  drawer.addEventListener('keydown',event => {
    if (event.key === 'Escape') closeCart();
    if (event.key === 'Tab') {
      const focusable = [...drawer.querySelectorAll('button,a[href]')].filter(node => !node.hidden && node.offsetParent !== null);
      const first = focusable[0], last = focusable[focusable.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const input = $('input[type="file"]'), uploadButton = $('[data-upload]'), photoStatus = $('#product-photo-status');
  uploadButton.addEventListener('click', () => input.click());
  $('#product-photo-remove').addEventListener('click', () => {
    uploadRevision++; uploading = false; photoPath = ''; input.value = ''; photoStatus.textContent = ''; $('#product-photo-preview').hidden = true; $('#product-photo-remove').hidden = true;
  });
  input.addEventListener('change', async () => {
    const file = input.files[0]; if (!file) return;
    const revision = ++uploadRevision;
    photoPath = ''; uploading = true; photoStatus.textContent = 'Preparando e enviando sua foto…';
    $('#product-photo-preview').hidden = true;
    $('#product-photo-remove').hidden = false;
    let url;
    try {
      if (!file.type.startsWith('image/') || file.size > 16*1024*1024) throw Error('Use uma imagem de até 16 MB.');
      url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve,reject) => {img.onload=resolve;img.onerror=()=>reject(Error('Formato não suportado. Envie uma foto JPG, PNG ou WebP.'));img.src=url;});
      const scale = Math.min(1,1200/Math.max(img.width,img.height));
      const canvas = document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve,'image/jpeg',0.72));
      if (!blob) throw Error('Não foi possível preparar a imagem.');
      const result = await window.autobarUploadPhoto(blob,'image/jpeg');
      if (revision !== uploadRevision) return;
      photoPath = result.path; const preview = $('#product-photo-preview'); preview.src=canvas.toDataURL('image/jpeg',0.5);preview.hidden=false;
      photoStatus.textContent = 'Foto enviada com sucesso.';
    } catch (error) { if (revision === uploadRevision) photoStatus.textContent = error.message || 'Não foi possível enviar a foto. Tente novamente.'; }
    finally { if (url) URL.revokeObjectURL(url); if (revision === uploadRevision) uploading=false; }
  });
  addEventListener('pageshow', count); count();
})();
