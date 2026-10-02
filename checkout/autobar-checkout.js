import {drawPixQr} from './pix-qr.js';
import {digits,formatCpf,formatCnpj,formatPhone,validCpf,validCnpj,validPhone,validCep,validName,validEmail} from './validation.js';

const api='https://personalizecar.vercel.app/api/autobar';
const productId='cc63486e-33dc-445a-acdf-8f93cdac3cf8';
const cartKey='store:cart',intentKey='autobar-inline-intent-v1',orderKey='autobar-inline-order-v1';
const $=id=>document.getElementById(id);
const money=cents=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
const errText={INVALID_CUSTOMER:'Revise nome, e-mail, CPF/CNPJ e celular.',INVALID_ADDRESS:'Revise o CEP e o endereço de entrega.',INVALID_PRODUCT:'A oferta mudou. Volte ao produto e atualize a compra.',INVALID_TOTAL:'O valor mudou. Revise o resumo e tente novamente.',PIX_MISSING:'O código Pix ainda não está disponível. Aguarde e tente novamente.',REQUEST_CONFLICT:'Os dados do pedido mudaram. Revise o resumo antes de tentar novamente.'};
let personType='fisica',pixEnabled=false,paymentPoll=null,renderedPixCode='',creating=false,currentOrder=null,lookupController=null,lastZip='';

function readCart(){
  let parsed;try{parsed=JSON.parse(localStorage.getItem(cartKey)||'[]')}catch{return []}
  if(!Array.isArray(parsed))return [];
  return parsed.filter(item=>item?.id===productId&&item.slug==='autobar'&&Number.isInteger(item.quantity)&&item.quantity>0)
    .map(item=>{const kitQty=item.kitQty>=2||/\bkit\s*2\b|\b2\s*unidades\b/i.test(item.size||'')?2:1;return {...item,price:kitQty===2?11900:7900,basePrice:7900,kitQty}});
}
let items=readCart();
const subtotal=()=>items.reduce((sum,item)=>sum+item.price*item.quantity,0);
const selectedShipping=()=>document.querySelector('input[name="shipping-method"]:checked')?.value==='sedex'?{method:'sedex',cents:2490,label:'SEDEX'}:{method:'pac',cents:0,label:'PAC'};
const total=()=>subtotal()+selectedShipping().cents;
const fingerprint=()=>JSON.stringify([items.map(item=>[item.id,item.price,item.quantity,item.kitQty,item.size,item.customization?.photoPath]),selectedShipping().method]);
const tracking=()=>{try{return JSON.parse(sessionStorage.getItem('autobar_attribution')||'{}')}catch{return {}}};
const sessionId=()=>{let id=sessionStorage.getItem('autobar_session');if(!id){id=crypto.randomUUID();sessionStorage.setItem('autobar_session',id)}return id};
const paymentRequest=async(action,body)=>{
  const response=await fetch(`${api}?action=${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',referrerPolicy:'no-referrer'});
  const result=await response.json().catch(()=>({}));
  if(!response.ok)throw Error(result.error||'PAYMENT_UNAVAILABLE');
  return result;
};

function renderSummary(target){
  target.replaceChildren();
  if(!items.length){
    const empty=document.createElement('p');empty.className='summary-empty';empty.textContent='Sua sacola está vazia. ';
    const link=document.createElement('a');link.href='/produto/autobar';link.textContent='Voltar à loja';empty.append(link);target.append(empty);return;
  }
  for(const [index,item] of items.entries()){
    const row=document.createElement('div');row.className='summary-item';
    const photo=document.createElement('img');photo.src=item.checkout_image_url||item.image_url||'/media/fa93a4a722715e36.webp';photo.alt='AutoBar';
    const main=document.createElement('div');main.className='summary-item-main';
    const title=document.createElement('strong');title.textContent=item.kitQty===2?'2 AutoBars™ personalizados':'AutoBar™ personalizado';
    const detail=document.createElement('small');const variant=String(item.size||'').replace(/^Kit\s*2\s*unidades\s*[•·-]?\s*/i,'').trim();detail.textContent=[item.kitQty===2?'Kit 2 unidades':'1 unidade',variant|| (item.customization?.station?`Posto: ${item.customization.station}`:'')].filter(Boolean).join(' · ');
    const price=document.createElement('div');price.className='summary-price';const amount=document.createElement('b');amount.textContent=money(item.price*item.quantity);price.append(amount);
    main.append(title,detail,price);
    if(!target.closest('aside')){
      const actions=document.createElement('div');actions.className='item-actions';const quantity=document.createElement('div');quantity.className='quantity-control';
      const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label',`Diminuir ou remover item ${index+1}`);minus.addEventListener('click',()=>changeQuantity(index,-1));
      const count=document.createElement('span');count.textContent=String(item.quantity);
      const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.disabled=item.quantity>=5;plus.setAttribute('aria-label',`Aumentar item ${index+1}`);plus.addEventListener('click',()=>changeQuantity(index,1));
      quantity.append(minus,count,plus);const remove=document.createElement('button');remove.type='button';remove.className='remove-unit';remove.textContent='✕';remove.setAttribute('aria-label',`Remover item ${index+1}`);remove.addEventListener('click',()=>changeQuantity(index,-item.quantity));
      actions.append(quantity,remove);main.append(actions);
    }
    row.append(photo,main);target.append(row);
  }
}
function renderTotals(target){
  target.replaceChildren();if(!items.length)return;
  const shipping=selectedShipping();
  for(const [label,cents,kind] of [['Produtos',subtotal(),''],[`Frete (${shipping.label})`,shipping.cents,''],['Total',total(),'total']]){
    const row=document.createElement('div');row.className=`total-row ${kind}`;const left=document.createElement('span');left.textContent=label;const right=document.createElement('span');right.textContent=kind===''&&label.startsWith('Frete')&&cents===0?'Grátis':money(cents);row.append(left,right);target.append(row);
  }
}
function renderAll(){
  document.querySelectorAll('.summary-content').forEach(renderSummary);
  document.querySelectorAll('.summary-totals').forEach(renderTotals);
  document.querySelectorAll('[data-count]').forEach(node=>node.textContent=String(items.reduce((sum,item)=>sum+item.quantity*item.kitQty,0)));
  $('identity-form').querySelector('button[type=submit]').disabled=!items.length;
  document.querySelector('.coupon').hidden=!items.length;
  $('pix-total').textContent=money(total());
  if(!items.length){$('delivery-step').hidden=true;$('payment-step').hidden=true;}
}
function invalidatePayment(message=''){
  if(paymentPoll){clearInterval(paymentPoll);paymentPoll=null}
  currentOrder=null;renderedPixCode='';sessionStorage.removeItem(intentKey);sessionStorage.removeItem(orderKey);
  $('pix-result').hidden=true;$('pix-code').value='';$('pix-qr-section').hidden=true;$('pix-qr-error').hidden=true;
  $('pix-create').hidden=false;$('pix-preparation').hidden=false;$('pix-status').textContent=message;
}
function changeQuantity(index,change){
  const item=items[index];if(!item)return;
  const next=item.quantity+change;if(next>5)return;
  if(next<=0)items.splice(index,1);else item.quantity=next;
  localStorage.setItem(cartKey,JSON.stringify(items));
  invalidatePayment('O pedido mudou. Confira o novo total antes de gerar outro Pix.');step(1);renderAll();
}
function step(number){
  for(const [index,id] of ['identity-step','delivery-step','payment-step'].entries())$(id).hidden=index+1!==number;
  document.querySelectorAll('.step').forEach(element=>{const index=Number(element.dataset.step);element.classList.toggle('current',index===number);element.classList.toggle('done',index<number)});
  window.scrollTo({top:0,behavior:'smooth'});
}
function showError(id,input,message){const notice=$(id);notice.textContent=message;notice.hidden=!message;if(input){input.setAttribute('aria-invalid','true');input.focus()}}
function identityChecks(){
  const name=$('customer-name'),email=$('customer-email'),document=$('customer-document'),phone=$('customer-phone');
  return [[name,personType==='fisica'?validName(name.value):name.value.trim().length>=3,'Informe o nome completo ou a razão social.'],[email,validEmail(email.value),'Informe um e-mail válido.'],[document,personType==='fisica'?validCpf(document.value):validCnpj(document.value),`Informe um ${personType==='fisica'?'CPF':'CNPJ'} válido.`],[phone,validPhone(phone.value),'Informe um celular válido com DDD e 9 dígitos.']];
}
function validateIdentity(){const checks=identityChecks();checks.forEach(([input])=>input.removeAttribute('aria-invalid'));const failed=checks.find(([,valid])=>!valid);showError('identity-error',failed?.[0],failed?.[2]||'');return !failed}
function maskInput(input,format){input.addEventListener('input',()=>{const before=digits(input.value.slice(0,input.selectionStart)).length;input.value=format(input.value);let position=0,count=0;for(let i=0;i<input.value.length;i++){if(/\d/.test(input.value[i]))count++;if(count===before){position=i+1;break}}input.setSelectionRange(before?position:0,before?position:0)})}
maskInput($('customer-document'),value=>personType==='fisica'?formatCpf(value):formatCnpj(value));maskInput($('customer-phone'),formatPhone);
for(const type of ['fisica','juridica'])$('person-'+type).addEventListener('click',()=>{
  personType=type;for(const choice of ['fisica','juridica']){const button=$('person-'+choice);button.classList.toggle('active',choice===type);button.setAttribute('aria-pressed',String(choice===type))}
  $('name-label').textContent=type==='fisica'?'Nome completo':'Razão social';$('document-label').textContent=type==='fisica'?'CPF':'CNPJ';$('customer-document').placeholder=type==='fisica'?'000.000.000-00':'00.000.000/0000-00';$('customer-document').value='';$('document-hint').textContent=type==='fisica'?'Confira os 11 dígitos do CPF.':'Confira os 14 dígitos do CNPJ.';showError('identity-error',null,'');
});
for(const [field,hintId] of [['customer-email','email-hint'],['customer-document','document-hint'],['customer-phone','phone-hint']]){
  const input=$(field),hint=$(hintId),original=hint.textContent;
  input.addEventListener('blur',()=>{if(!input.value.trim())return;const check=identityChecks().find(([element])=>element===input);hint.textContent=check[1]?original:check[2];hint.classList.toggle('field-error',!check[1]);input.setAttribute('aria-invalid',String(!check[1]))});
  input.addEventListener('input',()=>{input.removeAttribute('aria-invalid');hint.textContent=original;hint.classList.remove('field-error');showError('identity-error',null,'')});
}
$('identity-form').addEventListener('submit',event=>{event.preventDefault();if(items.length&&validateIdentity())step(2)});

const timer=document.querySelector('header + div p:last-child strong');
if(timer){const key='autobar-checkout-deadline-v1';let deadline=Number(sessionStorage.getItem(key));if(!deadline||deadline<Date.now()-86400000){deadline=Date.now()+900000;sessionStorage.setItem(key,String(deadline))}const tick=()=>{const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));timer.textContent=`00:${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`};tick();setInterval(tick,1000)}
$('summary-toggle').addEventListener('click',event=>{const content=event.currentTarget.nextElementSibling;content.hidden=!content.hidden;event.currentTarget.setAttribute('aria-expanded',String(!content.hidden))});
$('coupon-apply').addEventListener('click',()=>{const message=$('coupon-message');message.hidden=false;message.textContent='Cupons não estão disponíveis nesta oferta.'});
document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>step(Number(button.dataset.back))));

$('zip').addEventListener('input',()=>{
  const value=digits($('zip').value).slice(0,8);$('zip').value=value.length>5?`${value.slice(0,5)}-${value.slice(5)}`:value;
  if(value!==lastZip){for(const id of ['street','neighborhood','city','state'])$(id).value='';lastZip=value}
  lookupController?.abort();$('zip-status').textContent='';if(value.length===8)void lookupCep(value);
});
async function lookupCep(cep){
  lookupController=new AbortController();$('zip-status').textContent='Consultando CEP…';
  try{const response=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{signal:lookupController.signal,referrerPolicy:'no-referrer'});if(!response.ok)throw Error('lookup');const address=await response.json();if(digits($('zip').value)!==cep)return;if(address.erro){$('zip-status').textContent='CEP não encontrado. Confira o número.';return}for(const [id,value] of [['street',address.logradouro],['neighborhood',address.bairro],['city',address.localidade],['state',address.uf]])$(id).value=String(value||'');$('zip-status').textContent='Endereço encontrado. Confira os dados e informe o número.';$('house-number').focus()}
  catch(error){if(error.name!=='AbortError')$('zip-status').textContent='Não foi possível consultar o CEP. Preencha o endereço manualmente.'}
}
$('delivery-form').addEventListener('submit',event=>{
  event.preventDefault();const ids=['zip','street','house-number','neighborhood','city','state'];ids.forEach(id=>$(id).removeAttribute('aria-invalid'));
  if(!validCep($('zip').value)){showError('delivery-error',$('zip'),'Informe um CEP com 8 dígitos.');return}
  const missing=ids.slice(1).find(id=>!$(id).value.trim());if(missing){showError('delivery-error',$(missing),'Preencha todos os campos obrigatórios do endereço.');return}
  if(!/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/i.test($('state').value.trim())){showError('delivery-error',$('state'),'Informe uma sigla de estado válida.');return}
  if(!/^(\d+[A-Za-z]?|s\/?n)$/i.test($('house-number').value.trim())){showError('delivery-error',$('house-number'),'Informe um número válido ou S/N.');return}
  showError('delivery-error',null,'');const review=$('review');review.replaceChildren();const title=document.createElement('strong');title.textContent='Endereço de entrega';const line=document.createElement('p');line.textContent=`${$('street').value.trim()}, ${$('house-number').value.trim()}${$('complement').value.trim()?', '+$('complement').value.trim():''} — ${$('neighborhood').value.trim()}, ${$('city').value.trim()}/${$('state').value.trim().toUpperCase()} — CEP ${$('zip').value}`;const totalLine=document.createElement('p');totalLine.textContent=`Produtos: ${money(subtotal())}. Frete ${selectedShipping().label}: ${selectedShipping().cents?money(selectedShipping().cents):'grátis'}. Total: ${money(total())}.`;review.append(title,line,totalLine);window.autobarMarketing?.paymentStarted(total());step(3);
});

document.querySelectorAll('input[name="shipping-method"]').forEach(input=>input.addEventListener('change',()=>{const hadPix=!!currentOrder;sessionStorage.setItem('autobar-shipping-v1',selectedShipping().method);invalidatePayment(hadPix?'O Pix anterior corresponde ao frete antigo. Gere um novo código para esta opção.':'');renderAll()}));
const savedShipping=sessionStorage.getItem('autobar-shipping-v1');if(savedShipping==='sedex')document.querySelector('input[name="shipping-method"][value="sedex"]').checked=true;

function showPayment(order){
  currentOrder=order;const status=order.status;
  if(Number.isInteger(order.amount)&&order.amount>0)$('pix-total').textContent=money(order.amount);
  const code=order.pix?.url||order.pix?.qrcode||'';
  $('pix-result').hidden=!code;$('pix-code').value=code;
  $('pix-preparation').hidden=!!code;
  $('pix-create').hidden=!!code&&!['REFUSED','CANCELED','ERROR'].includes(status);
  const payable=status==='PENDING'||status==='UNKNOWN',paid=status==='PAID';
  const state=$('pix-state');state.classList.toggle('paid',paid);state.classList.toggle('failed',!paid&&!payable);
  state.querySelector('strong').textContent=paid?'Pagamento confirmado':payable?'Aguardando seu pagamento':status==='REFUNDED'?'Pagamento estornado':'Pagamento não confirmado';
  $('pix-qr-section').hidden=!payable||!code;$('pix-qr-error').hidden=true;
  if(payable&&code&&renderedPixCode!==code){try{drawPixQr($('pix-qr'),code);renderedPixCode=code}catch{$('pix-qr-section').hidden=true;$('pix-qr-error').hidden=false}}
  for(const element of [$('pix-code'),$('pix-copy'),document.querySelector('.pix-help'),document.querySelector('label[for="pix-code"]')])element.hidden=!payable;
  $('pix-status').textContent=paid?'Pagamento confirmado. Obrigado pela compra!':order.verificationDelayed?'Ainda não foi possível confirmar o pagamento. A consulta será retomada automaticamente.':status==='UNKNOWN'?'O status está em verificação. Não gere outra cobrança.':payable?'':'Pagamento não confirmado. Entre em contato com o atendimento.';
  if(payable&&code&&!paymentPoll)paymentPoll=setInterval(()=>void refreshPayment(),15000);
  if(!payable&&paymentPoll){clearInterval(paymentPoll);paymentPoll=null}
  if(paid){window.autobarMarketing?.purchase(order.orderId,order.amount);sessionStorage.removeItem(intentKey)}
}
async function refreshPayment(){if(!currentOrder?.orderId||!currentOrder?.gatewayId)return;try{const next=await paymentRequest('status',{orderId:currentOrder.orderId,gatewayId:currentOrder.gatewayId});sessionStorage.setItem(orderKey,JSON.stringify({...next,fingerprint:fingerprint()}));showPayment(next)}catch{$('pix-status').textContent='Não foi possível consultar o status agora. Tentaremos novamente em instantes.'}}

$('pix-create').addEventListener('click',async()=>{
  if(!pixEnabled||!items.length||creating)return;
  if(!validateIdentity()){step(1);return}
  const address={zipCode:$('zip').value,street:$('street').value.trim(),streetNumber:$('house-number').value.trim(),complement:$('complement').value.trim(),neighborhood:$('neighborhood').value.trim(),city:$('city').value.trim(),state:$('state').value.trim().toUpperCase()};
  const shipping=selectedShipping();const stamp=JSON.stringify([fingerprint(),personType,$('customer-name').value,$('customer-email').value,$('customer-document').value,$('customer-phone').value,address]);
  let intent;try{intent=JSON.parse(sessionStorage.getItem(intentKey)||'null')}catch{}
  if(!intent||intent.stamp!==stamp){intent={stamp,key:crypto.randomUUID()};sessionStorage.setItem(intentKey,JSON.stringify(intent))}
  const body={requestKey:intent.key,paymentMethod:'PIX',amount:total(),shippingCents:shipping.cents,shippingMethod:shipping.method,discountCents:0,couponCode:null,giftWrapCents:0,customer:{name:$('customer-name').value.trim(),email:$('customer-email').value.trim(),phone:$('customer-phone').value,document:$('customer-document').value,documentType:personType==='fisica'?'CPF':'CNPJ'},address,items:items.map(item=>({id:productId,slug:'autobar',title:item.kitQty===2?'2x AutoBar™':'AutoBar™',unitPrice:item.price,quantity:item.quantity,variant:item.size||'',customization:{station:item.customization?.station||'',photoPath:item.customization?.photoPath||''}})),trackingParameters:tracking()};
  creating=true;$('pix-create').disabled=true;$('pix-status').textContent='Gerando cobrança Pix…';
  try{const order=await paymentRequest('create',body);sessionStorage.setItem(orderKey,JSON.stringify({...order,fingerprint:fingerprint()}));showPayment(order)}
  catch(error){$('pix-status').textContent=errText[error.message]||'Não foi possível confirmar a cobrança. Aguarde e tente novamente com este pedido.'}
  finally{creating=false;$('pix-create').disabled=false}
});
$('pix-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('pix-code').value);$('pix-copy-label').textContent='Código copiado!';$('pix-status').textContent='Código Pix copiado. Cole no aplicativo do seu banco.';void paymentRequest('copy-pix',{id:sessionId()}).catch(()=>{});setTimeout(()=>$('pix-copy-label').textContent='Copiar código Pix',3000)}catch{$('pix-code').select();$('pix-status').textContent='Selecione e copie o código Pix.'}});
$('pix-option').addEventListener('click',()=>{if(pixEnabled)$('pix-option').setAttribute('aria-pressed','true')});
paymentRequest('config',{}).then(config=>{pixEnabled=config.checkoutEnabled===true;if(!pixEnabled){document.querySelector('.checkout-status').textContent='Pagamento Pix indisponível no momento.';return}$('pix-option').disabled=false;$('pix-option').setAttribute('aria-pressed','true');$('pix-label').textContent='DISPONÍVEL';$('payment-unavailable').hidden=true;$('pix-panel').hidden=false;document.querySelector('.checkout-status').hidden=true;let saved;try{saved=JSON.parse(sessionStorage.getItem(orderKey)||'null')}catch{}if(saved?.fingerprint===fingerprint()&&saved.orderId&&saved.gatewayId&&saved.pix){step(3);showPayment(saved);if(saved.status==='PENDING')void refreshPayment()}}).catch(()=>document.querySelector('.checkout-status').textContent='Não foi possível verificar o pagamento Pix agora.');

document.querySelector('footer form')?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;let note=form.nextElementSibling;if(!note?.classList?.contains('newsletter-note')){note=document.createElement('p');note.className='newsletter-note';note.textContent='Cadastro de e-mail indisponível neste checkout.';form.after(note)}});
renderAll();
