import QR from './assets/browser-K1xQXUCo.js';
(() => {
  const $=id=>document.getElementById(id),saved=sessionStorage.getItem('pix_payment');
  let order;try{order=JSON.parse(saved||'null')}catch{}
  if(!order?.orderId||!order?.gatewayId||!order?.pixCode){location.replace('/checkout');return}
  $('amount').textContent=new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format((Number(order.amount)||0)/100);
  QR.toDataURL(order.pixCode,{width:480,margin:0}).then(src=>$('qr').src=src).catch(()=>$('message').textContent='Não foi possível gerar o QR Code. Use o código Pix abaixo.');
  $('copy').onclick=async()=>{try{await navigator.clipboard.writeText(order.pixCode);$('copy').textContent='Código copiado!';void window.autobarCopiedPix?.();setTimeout(()=>$('copy').textContent='Copiar código Pix',2200)}catch{$('message').textContent='Não foi possível copiar automaticamente.'}};
  async function check(){try{const response=await fetch('https://personalizecar.vercel.app/api/autobar?action=status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:order.orderId,gatewayId:order.gatewayId})});if(!response.ok)return;const data=await response.json();if(data.status==='PAID'){$('title').textContent='Pagamento confirmado!';$('badge').textContent='Pago';$('badge').classList.add('paid');$('message').textContent='Seu pedido foi recebido. Obrigado pela compra.';clearInterval(timer);sessionStorage.removeItem('autobar_order_intent')}else if(['REFUSED','CANCELED','REFUNDED','CHARGEBACK'].includes(data.status)){$('message').textContent='Pagamento não confirmado. Entre em contato com o atendimento.';clearInterval(timer)}}catch{}}
  const timer=setInterval(check,10000);void check();
})();
