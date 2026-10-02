(() => {
  const api='https://personalizecar.vercel.app/api/autobar';
  const originalFetch=window.fetch.bind(window);
  const marketingKeys=['src','sck','utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid','ttclid'];
  const checkoutErrors={INVALID_ORDER:'Confira os dados do pedido e tente novamente.',INVALID_CUSTOMER:'Confira nome, e-mail, telefone e CPF.',INVALID_ADDRESS:'Confira CEP e endereço de entrega.',INVALID_PRODUCT:'O produto mudou. Atualize a página e tente novamente.',INVALID_TOTAL:'O valor do pedido mudou. Atualize a página e confira o total.',INVALID_PHOTO:'Não foi possível validar a foto. Envie novamente.',PIX_MISSING:'O gateway não retornou o código Pix. Aguarde e tente novamente.',REQUEST_CONFLICT:'Os dados do pedido mudaram. Atualize a página e tente novamente.',PAYMENT_UNAVAILABLE:'Não foi possível confirmar o Pix agora. Aguarde e tente novamente.'};
  try{
    const key='store:cart',items=JSON.parse(localStorage.getItem(key)||'[]');
    if(Array.isArray(items)&&items.some(item=>item.id==='cc63486e-33dc-445a-acdf-8f93cdac3cf8'&&item.slug==='autobar')){
      localStorage.setItem(key,JSON.stringify(items.map(item=>{
        if(item.id!=='cc63486e-33dc-445a-acdf-8f93cdac3cf8'||item.slug!=='autobar')return item;
        const kitQty=item.kitQty>=2||/\bkit\s*2\b|\b2\s*unidades\b/i.test(item.size||'')?2:1;
        return {...item,price:kitQty===2?11900:7900,kitQty,basePrice:7900,...(Array.isArray(item.units)?{units:item.units.slice(0,kitQty)}:{})};
      })));
    }
  }catch{}
  const attribution=()=>{const q=new URLSearchParams(location.search),next=Object.fromEntries(marketingKeys.map(k=>[k,q.get(k)]).filter(([,v])=>v).map(([k,v])=>[k,v.slice(0,200)]));if(Object.keys(next).length)sessionStorage.setItem('autobar_attribution',JSON.stringify(next));try{return JSON.parse(sessionStorage.getItem('autobar_attribution')||'{}')}catch{return {}}};
  const source=()=>{const a=attribution(),utm=String(a.utm_source||'').toLowerCase();return a.ttclid||utm.includes('tiktok')?'TikTok Ads':a.fbclid||/facebook|instagram|meta|fb/.test(utm)?'Meta Ads':utm?'Outras campanhas':'Orgânico/Direto'};
  const stage=()=>location.pathname==='/checkout'?'checkout':location.pathname==='/pagamento-pix'?'payment':'home';
  const sessionId=()=>{let id=sessionStorage.getItem('autobar_session');if(!id){id=crypto.randomUUID();sessionStorage.setItem('autobar_session',id)}return id};
  window.autobarUploadPhoto=async(blob,mimeType)=>{
    if(blob.size>1000000)throw Error('Imagem muito grande após compressão. Use uma foto menor.');
    const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Falha ao ler a imagem'));reader.readAsDataURL(blob)});
    const response=await originalFetch(`${api}?action=photo`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mimeType,data})});
    const result=await response.json();if(!response.ok||!result.path)throw Error('Não foi possível salvar a foto.');
    return {path:result.path,error:null};
  };
  window.autobarLookupTracking=async query=>{try{const response=await originalFetch(`${api}?action=track`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:query})});if(!response.ok)throw Error('Busca indisponível');return {data:(await response.json()).data||[],error:null}}catch(error){return {data:[],error}}};
  window.autobarCopiedPix=async()=>{try{await originalFetch(`${api}?action=copy-pix`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sessionId()}),keepalive:true})}catch{}};
  async function visit(){try{await originalFetch(`${api}?action=visit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:sessionId(),stage:stage(),source:source()}),keepalive:true})}catch{}}
  window.fetch=(input,init={})=>{
    const url=typeof input==='string'?input:input?.url;
    if(url==='/api/public/create-payment'){
      const body=JSON.parse(init.body||'{}'),signature=JSON.stringify([body.customer?.email,body.amount,body.items,body.couponCode]);
      let saved;try{saved=JSON.parse(sessionStorage.getItem('autobar_order_intent')||'null')}catch{}
      if(!saved||saved.signature!==signature){saved={signature,key:crypto.randomUUID()};sessionStorage.setItem('autobar_order_intent',JSON.stringify(saved))}
      window.autobarMarketing?.paymentStarted(body.amount);
      return originalFetch(`${api}?action=create`,{...init,body:JSON.stringify({...body,requestKey:saved.key,trackingParameters:{...body.trackingParameters,...attribution()}})}).then(async response=>{const result=await response.clone().json().catch(()=>({}));if(response.ok){if(result.status==='PAID')window.autobarMarketing?.purchase(result.orderId,result.amount);return response}const error=checkoutErrors[result.error];return error?new Response(JSON.stringify({error}),{status:response.status,headers:{'Content-Type':'application/json'}}):response});
    }
    if(url==='/api/public/check-payment-status')return originalFetch(`${api}?action=status`,init).then(async response=>{if(response.ok){const copy=response.clone(),result=await copy.json().catch(()=>({}));if(result.status==='PAID'){sessionStorage.removeItem('autobar_order_intent');window.autobarMarketing?.purchase(result.orderId,result.amount)}}return response});
    return originalFetch(input,init);
  };
  document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(!link||link.target||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const url=new URL(link.href,location.href);if(url.origin===location.origin&&url.pathname==='/checkout'){event.preventDefault();location.assign(url.href)}},true);
  addEventListener('popstate',visit);addEventListener('pageshow',visit);setInterval(()=>{if(!document.hidden)void visit()},30000);void visit();
})();
