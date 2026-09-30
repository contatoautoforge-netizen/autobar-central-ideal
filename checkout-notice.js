(() => {
  const id = 'autobar-checkout-notice';
  let scheduled = false;
  let checkoutEnabled = false;
  function sync() {
    scheduled = false;
    const existing = document.getElementById(id);
    if (location.pathname !== '/checkout' || checkoutEnabled) {
      existing?.remove();
      return;
    }
    if (existing || !document.body) return;
    const notice = document.createElement('div');
    notice.id = id;
    notice.setAttribute('role', 'status');
    notice.textContent = 'Prévia do checkout: pedidos e pagamentos estão indisponíveis neste site.';
    notice.style.cssText = 'position:relative;z-index:1000;background:#fff0b8;color:#242424;text-align:center;padding:10px 16px;font:600 13px/1.4 Arial,sans-serif';
    document.body.prepend(notice);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(sync);
  }
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('popstate', schedule);
  window.addEventListener('load', schedule);
  fetch('https://personalizecar.vercel.app/api/autobar?action=config', {method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.ok?r.json():null).then(data=>{checkoutEnabled=data?.checkoutEnabled===true;schedule()}).catch(()=>{});
  schedule();
})();
