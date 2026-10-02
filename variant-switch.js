(() => {
  const mount=()=>{
    const title=document.querySelector('h1');
    if(!title||document.getElementById('gelabar-variant-switch'))return;
    const nav=document.createElement('nav');
    nav.id='gelabar-variant-switch';
    nav.className='model-picker';
    nav.setAttribute('aria-label','Escolha o modelo do produto');
    nav.innerHTML='<div class="model-picker__heading"><strong>Escolha o modelo</strong><span>Selecione a versão que combina com você</span></div><div class="model-picker__grid"><a class="model-picker__option" href="/produto/autobar" aria-current="page"><img src="/media/gelabar-thumb.jpg" alt=""><span class="model-picker__copy"><strong>GelaBar</strong><small>Carro + posto</small></span><span class="model-picker__check" aria-hidden="true">✓</span></a><a class="model-picker__option" href="/produto/agrobar"><img src="/media/agrobar-1.webp" alt=""><span class="model-picker__copy"><strong>AgroBar</strong><small>Colheitadeira</small></span><span class="model-picker__check" aria-hidden="true">✓</span></a></div>';
    title.parentElement.insertBefore(nav,title);
  };
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  mount();
})();
