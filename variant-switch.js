(() => {
  const mount=()=>{
    const title=document.querySelector('h1');
    if(!title||document.getElementById('gelabar-variant-switch'))return;
    const nav=document.createElement('nav');
    nav.id='gelabar-variant-switch';
    nav.setAttribute('aria-label','Escolha o modelo');
    nav.innerHTML='<span>Escolha seu modelo</span><a href="/produto/autobar" aria-current="page">GelaBar · Carro</a><a href="/produto/agrobar">AgroBar · Colheitadeira</a>';
    title.parentElement.insertBefore(nav,title);
  };
  new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
  mount();
})();
