(() => {
  const id='c4a64980-0d6e-4f27-a79f-db44118b2d5b';
  const cartKey='store:cart';
  const nameField=document.getElementById('custom-name');
  const message=document.getElementById('cart-message');
  let kit=1;
  const cart=()=>{try{const value=JSON.parse(localStorage.getItem(cartKey)||'[]');return Array.isArray(value)?value:[]}catch{return []}};
  const updateCount=()=>{document.getElementById('cart-count').textContent=String(cart().reduce((sum,item)=>sum+(Number(item.kitQty)||1)*(Number(item.quantity)||1),0))};
  const price=()=>kit===2?11900:7900;
  const money=cents=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
  document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{document.getElementById('hero-image').src=button.dataset.image;document.querySelectorAll('[data-image]').forEach(other=>other.classList.toggle('active',other===button))}));
  document.querySelectorAll('[data-kit]').forEach(button=>button.addEventListener('click',()=>{kit=Number(button.dataset.kit);document.querySelectorAll('[data-kit]').forEach(other=>{const selected=other===button;other.classList.toggle('selected',selected);other.setAttribute('aria-pressed',String(selected))});document.getElementById('saving').textContent=`Você economiza ${money(kit===2?48100:22100)} nesta compra`}));
  function add(buyNow){
    const name=nameField.value.trim();
    if(name&&!/^[\p{L}\p{N} ]{1,12}$/u.test(name)){message.textContent='Use até 12 letras ou números no nome personalizado.';nameField.focus();return}
    const items=cart();
    const size=`AgroBar${name?` · Nome: ${name}`:''}`;
    const existing=items.find(item=>item.id===id&&item.slug==='agrobar'&&item.size===size&&Number(item.kitQty)===kit);
    if(existing){existing.quantity=Math.min(5,(Number(existing.quantity)||1)+1)}
    else items.push({id,slug:'agrobar',name:'AgroBar™ – Dispenser de Bebidas Colheitadeira + Nome Personalizado',price:price(),basePrice:7900,kitQty:kit,quantity:1,size,customization:{name},image_url:'/media/agrobar-1.webp',checkout_image_url:'/media/agrobar-1.webp',buyNow});
    localStorage.setItem(cartKey,JSON.stringify(items));updateCount();
    if(buyNow){location.assign('/checkout');return}
    message.innerHTML=`AgroBar adicionado ao carrinho por ${money(price())}. <a href="/checkout">Finalizar pedido</a>`;
  }
  document.getElementById('buy-now').addEventListener('click',()=>add(true));
  document.getElementById('add-cart').addEventListener('click',()=>add(false));
  addEventListener('pageshow',updateCount);updateCount();
})();
