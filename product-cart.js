import {readStoredCart} from './storefront-state.js';

export function addProductToCart(storage, product, selection) {
  const {station, photoPath = '', kit = 1, buyNow = false} = selection;
  const option = product.customization.station.options.find(option => option.name === station);
  if (!option) throw Error('Escolha o posto para continuar.');
  if (![1, 2].includes(kit)) throw Error('Escolha uma oferta válida.');
  const size = [kit === 2 ? 'Kit 2 unidades' : '', `Posto: ${station}`, photoPath ? 'Foto do veículo enviada' : ''].filter(Boolean).join(' • ');
  const items = readStoredCart(storage);
  const existing = items.find(item => item.id === product.id && item.size === size && (item.customization?.photoPath || '') === photoPath);
  if (existing) existing.quantity = Math.min(5, existing.quantity + 1);
  else items.push({id:product.id, slug:product.slug, name:product.name, price:kit === 2 ? 11900 : 7900,
    basePrice:7900, kitQty:kit, quantity:1, size, buyNow,
    image_url:'/media/gelabar-thumb.jpg', checkout_image_url:'/media/gelabar-thumb.jpg',
    customization:{station, stationImage:option.image, photoPath},
    ...(kit === 2 ? {units:[size, size]} : {})});
  try { storage.setItem('store:cart', JSON.stringify(items)); }
  catch { throw Error('Não foi possível salvar o carrinho neste navegador. Libere o armazenamento do site e tente novamente.'); }
  return items;
}
