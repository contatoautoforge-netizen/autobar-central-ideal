export function paymentState(order,{verified=false,expectedAmount}={}){
 const matches=Number.isSafeInteger(order?.amount)&&order.amount>0&&(expectedAmount===undefined||order.amount===expectedAmount);
 const paid=verified&&matches&&order.status==='PAID';
 // Stored browser data can restore the view, but cannot confirm a purchase.
 const status=!verified&&order?.status==='PAID'?'UNKNOWN':order?.status;
 return {paid,status,payable:matches&&['PENDING','UNKNOWN'].includes(status),matches};
}

export function acceptsPaymentResponse(result,{fingerprint,currentFingerprint,orderId,amount}){
 return fingerprint===currentFingerprint&&!!result?.orderId&&(!orderId||result.orderId===orderId)&&Number.isSafeInteger(result.amount)&&result.amount===amount;
}
