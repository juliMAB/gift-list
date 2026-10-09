// Se inyecta en la página del producto con chrome.scripting.executeScript.
// Debe ser autónoma: no puede usar variables de fuera de la función.
function extractGift() {
  const q = (sel) => document.querySelector(sel);
  const meta = (p) => {
    const e = q('meta[property="' + p + '"]') || q('meta[name="' + p + '"]');
    return e ? (e.getAttribute('content') || '').trim() : '';
  };
  const txt = (sel) => {
    const e = q(sel);
    return e ? e.textContent.trim() : '';
  };

  let title = meta('og:title') || meta('twitter:title') || (q('h1') ? q('h1').textContent.trim() : document.title);
  let image = meta('og:image') || meta('twitter:image') || ((q('img') || {}).src || '');
  let desc = meta('og:description') || meta('description') || '';
  let price = meta('product:price:amount') || meta('og:price:amount') || '';
  let currency = meta('product:price:currency') || meta('og:price:currency') || '';

  // JSON-LD (Product + offers). Es lo que mejor anda en Amazon y ML.
  const blocks = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  for (const b of blocks) {
    let json;
    try { json = JSON.parse(b.textContent.trim()); } catch (e) { continue; }
    const walk = (n) => {
      if (!n) return;
      if (Array.isArray(n)) { n.forEach(walk); return; }
      if (typeof n !== 'object') return;
      const t = String(n['@type'] || '').toLowerCase();
      if (t.indexOf('product') !== -1) {
        if (!title && n.name) title = String(n.name);
        if (!desc && n.description) desc = String(n.description);
        if (!image && n.image) image = Array.isArray(n.image) ? String(n.image[0]) : String(n.image);
        if (n.offers) {
          const o = Array.isArray(n.offers) ? n.offers[0] : n.offers;
          if (o && typeof o === 'object') {
            if (!price && o.price) price = String(o.price);
            if (!currency && o.priceCurrency) currency = String(o.priceCurrency);
          }
        }
      }
      if (n['@graph']) walk(n['@graph']);
    };
    walk(json);
  }

  // Fallbacks por tienda (Mercado Libre usa clases andes-*, Amazon itemprop).
  if (!price) price = txt('[itemprop="price"]') || txt('.andes-money-amount__fraction') || '';
  if (!currency) currency = txt('.andes-money-amount__currency-symbol') || txt('.a-price-symbol') || '';
  if (!image) {
    const img = q('#landingImage') || q('#imgBlkFront') || q('.ui-pdp-image') || q('.andes-gallery img');
    if (img && img.src) image = img.src;
  }

  try { if (image) image = new URL(image, location.href).href; } catch (e) {}

  return {
    title: String(title || '').slice(0, 200),
    description: String(desc || '').slice(0, 600),
    link: location.href,
    price: (price ? (currency ? currency + ' ' + price : price) : '').slice(0, 60),
    image_url: String(image || '').slice(0, 500)
  };
}
