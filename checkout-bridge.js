(() => {
  const api='https://personalizecar.vercel.app/api/autobar';
  const originalFetch=window.fetch.bind(window);
  const source=()=>{const q=new URLSearchParams(location.search),utm=(q.get('utm_source')||sessionStorage.getItem('autobar_utm_source')||'').toLowerCase();if(q.get('utm_source'))sessionStorage.setItem('autobar_utm_source',q.get('utm_source'));return utm.includes('tiktok')?'TikTok Ads':/facebook|instagram|meta|fb/.test(utm)?'Meta Ads':utm?'Outras campanhas':'Orgânico/Direto'};
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
      return originalFetch(`${api}?action=create`,{...init,body:JSON.stringify({...body,requestKey:saved.key,trackingParameters:{...body.trackingParameters,utm_source:new URLSearchParams(location.search).get('utm_source')||sessionStorage.getItem('autobar_utm_source')||''}})});
    }
    if(url==='/api/public/check-payment-status')return originalFetch(`${api}?action=status`,init).then(async response=>{if(response.ok){const copy=response.clone(),result=await copy.json().catch(()=>({}));if(result.status==='PAID')sessionStorage.removeItem('autobar_order_intent')}return response});
    return originalFetch(input,init);
  };
  addEventListener('popstate',visit);addEventListener('pageshow',visit);setInterval(()=>{if(!document.hidden)void visit()},30000);void visit();
})();
