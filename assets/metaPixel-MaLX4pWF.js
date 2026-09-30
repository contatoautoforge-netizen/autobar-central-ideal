const noop=async()=>{};
const n={pageView:noop,viewContent:noop,addToCart:noop,initiateCheckout:noop,addPaymentInfo:noop,purchase:noop,lead:noop};
const t={getAdSignals:()=>({}),initMetaPixels:async()=>[],initTiktokPixels:async()=>[],metaTrack:n,trackMetaEvent:noop};
export{n,t};
