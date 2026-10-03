(() => {
  // Markup belongs to the page renderer. Never insert nodes into React's tree
  // from a load handler: load does not guarantee hydration has finished.
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('.model-picker__option');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const target=new URL(link.href,location.href);
    if(target.origin!==location.origin)return;
    event.preventDefault();
    event.stopImmediatePropagation();
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
})();
