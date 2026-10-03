import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {paymentState,acceptsPaymentResponse} from './checkout/payment-state.js';
import {digits,nationalPhone,formatPhone,validPhone,validCpf,validCnpj} from './checkout/validation.js';

test('cached PAID cannot confirm a purchase; fresh matching server response can',()=>{
 const order={orderId:'order-1',amount:7900,status:'PAID'};
 assert.equal(paymentState(order,{expectedAmount:7900}).paid,false);
 assert.equal(paymentState(order,{verified:true,expectedAmount:11900}).paid,false);
 assert.equal(paymentState(order,{verified:true,expectedAmount:7900}).paid,true);
 assert.equal(acceptsPaymentResponse(order,{fingerprint:'old',currentFingerprint:'new',amount:7900}),false);
 assert.equal(acceptsPaymentResponse(order,{fingerprint:'same',currentFingerprint:'same',orderId:'another-order',amount:7900}),false);
 assert.equal(acceptsPaymentResponse(order,{fingerprint:'same',currentFingerprint:'same',orderId:'order-1',amount:7900}),true);
});

test('phone mask preserves number and caret on extra digit, replacement and international paste',()=>{
 const code=fs.readFileSync(new URL('./checkout/autobar-checkout.js',import.meta.url),'utf8');
 const body=code.slice(code.indexOf('function maskInput('),code.indexOf("maskInput($('customer-document')"));
 const context=vm.createContext({digits,nationalPhone});vm.runInContext(body,context);
 const handlers={},input={value:'',selectionStart:0,addEventListener:(name,fn)=>handlers[name]=fn,setSelectionRange(start){this.selectionStart=start}};
 context.maskInput(input,formatPhone,11);
 const edit=(text,from=input.selectionStart,to=from)=>{handlers.beforeinput();input.value=input.value.slice(0,from)+text+input.value.slice(to);input.selectionStart=from+text.length;handlers.input()};
 for(const digit of '11987654321')edit(digit);
 assert.equal(input.value,'(11) 98765-4321');const caret=input.selectionStart;
 edit('9');assert.equal(input.value,'(11) 98765-4321');assert.equal(input.selectionStart,caret);
 input.selectionStart=6;edit('8',6,7);assert.equal(input.value,'(11) 98765-4321');
 input.selectionStart=0;edit('+55 21 91234-5678',0,input.value.length);assert.equal(input.value,'(21) 91234-5678');
 assert.equal(validPhone(input.value),true);assert.equal(validCpf('111.111.111-11'),false);assert.equal(validCpf('529.982.247-25'),true);assert.equal(validCnpj('11.222.333/0001-81'),true);
});
