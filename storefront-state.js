// Only valid cart rows may enter React state. Old or malformed browser data
// must not take down the product page.
export function normalizeStoredCart(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && typeof item === 'object'
    && typeof item.id === 'string' && typeof item.slug === 'string'
    && Number.isFinite(item.price) && item.price > 0
    && Number.isInteger(item.quantity) && item.quantity > 0);
}

export function readStoredCart(storage) {
  try { return normalizeStoredCart(JSON.parse(storage.getItem('store:cart') || '[]')); }
  catch { return []; }
}
