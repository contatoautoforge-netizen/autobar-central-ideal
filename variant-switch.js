(() => {
  const mount=()=>{
    const existing=document.querySelector('.model-picker');
    if(existing){existing.id ||= 'gelabar-variant-switch';return}
    const title=document.querySelector('h1');
    if(!title||document.getElementById('gelabar-variant-switch'))return;
    const nav=document.createElement('nav');
    nav.id='gelabar-variant-switch';
    nav.className='model-picker';
    nav.setAttribute('aria-label','Escolha o modelo do produto');
    nav.innerHTML='<div class="model-picker__heading"><strong>Escolha o modelo</strong><span>Selecione a versão que combina com você</span></div><div class="model-picker__grid"><a class="model-picker__option" href="/produto/autobar" aria-current="page"><img src="/media/gelabar-thumb.jpg" alt=""><span class="model-picker__copy"><strong>GelaBar</strong><small>Carro + posto</small></span><span class="model-picker__check" aria-hidden="true">✓</span></a><a class="model-picker__option" href="/produto/agrobar"><img src="/media/agrobar-1.webp" alt=""><span class="model-picker__copy"><strong>AgroBar</strong><small>Colheitadeira</small></span><span class="model-picker__check" aria-hidden="true">✓</span></a></div>';
    title.parentElement.insertBefore(nav,title);
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('.model-picker__option');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const target=new URL(link.href,location.href);
    if(target.origin!==location.origin)return;
    event.preventDefault();
    if(target.pathname===location.pathname)return;
    const selected=target.pathname==='/produto/agrobar'?'agrobar':'autobar';
    try{
      const cart=JSON.parse(localStorage.getItem('store:cart')||'[]');
      if(Array.isArray(cart)){
        const next=cart.filter(item=>!['autobar','agrobar'].includes(item?.slug)||item.slug===selected);
        if(next.length!==cart.length){
          localStorage.setItem('store:cart',JSON.stringify(next));
          for(const key of ['autobar-inline-intent-v1','autobar-inline-order-v1','autobar_order_intent'])sessionStorage.removeItem(key);
        }
      }
    }catch{}
    location.assign(target.href);
  },true);
  // The GelaBar page is hydrated by React. Avoid changing its initial HTML
  // before the page has loaded.
  const start=()=>{
    mount();
    const parent=document.getElementById('gelabar-variant-switch')?.parentElement;
    if(parent&&location.pathname==='/produto/autobar')new MutationObserver(()=>{if(!document.getElementById('gelabar-variant-switch'))mount()}).observe(parent,{childList:true});
  };
  if(document.readyState==='complete')start();
  else addEventListener('load',start,{once:true});
})();
