// Valores por defecto (los mismos de la app). Se pueden cambiar en Configuración.
const DEFAULTS = {
  supabaseUrl: 'https://piuuwzgodcfoybznmcba.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdXV3emdvZGNmb3liem5tY2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODkwMDgsImV4cCI6MjEwNzA2NTAwOH0.gSHcRt_8IayRD9_k7Sl2pKc7uiRLuwagNarKkkyuP_g',
  appUrl: 'https://gift-list-beige.vercel.app'
};

const $ = (id) => document.getElementById(id);

function setStatus(msg, kind) {
  const el = $('status');
  el.textContent = msg || '';
  el.className = 'status' + (kind ? ' ' + kind : '');
}

async function getConfig() {
  const s = await chrome.storage.sync.get(['supabaseUrl', 'anonKey', 'appUrl']);
  return {
    supabaseUrl: (s.supabaseUrl || DEFAULTS.supabaseUrl || '').replace(/\/+$/, ''),
    anonKey: s.anonKey || DEFAULTS.anonKey || '',
    appUrl: s.appUrl || DEFAULTS.appUrl || ''
  };
}

function fillForm(d) {
  $('title').value = d.title || '';
  $('description').value = d.description || '';
  $('price').value = d.price || '';
  $('link').value = d.link || '';
  $('image_url').value = d.image_url || '';
  if (d.image_url) {
    $('thumb').src = d.image_url;
    $('thumbwrap').style.display = 'block';
  }
}

async function readPage() {
  setStatus('Leyendo la página…');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    setStatus('No pude acceder a la pestaña.', 'err');
    return;
  }
  try {
    const res = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractGift
    });
    const d = (res && res[0] && res[0].result) || {};
    fillForm(d);
    if (d.title || d.price || d.image_url) setStatus('Datos leídos. Revisá y agregá.', 'ok');
    else setStatus('No encontré datos claros. Completá a mano.', 'err');
  } catch (e) {
    setStatus('No pude leer esta página. Completá a mano.', 'err');
    $('link').value = tab.url || '';
  }
}

async function submit() {
  const cfg = await getConfig();
  if (!cfg.supabaseUrl || !cfg.anonKey) {
    setStatus('Falta configurar la conexión. Abrí Configuración.', 'err');
    return;
  }
  const body = {
    title: $('title').value.trim(),
    description: $('description').value.trim(),
    link: $('link').value.trim(),
    price: $('price').value.trim(),
    image_url: $('image_url').value.trim() || null,
    status: 'available'
  };
  if (!body.title) {
    setStatus('Poné al menos un título.', 'err');
    return;
  }

  $('submit').disabled = true;
  setStatus('Guardando…');
  try {
    const r = await fetch(cfg.supabaseUrl + '/rest/v1/gifts', {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: 'Bearer ' + cfg.anonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      let extra = '';
      try {
        const j = await r.json();
        if (j && j.message) extra = ': ' + j.message;
      } catch (e) {}
      throw new Error(r.status + extra);
    }
    setStatus('Listo, agregado a la lista.', 'ok');
    $('viewlist').href = cfg.appUrl;
    $('donebar').style.display = 'flex';
  } catch (e) {
    setStatus('No se pudo guardar: ' + e.message, 'err');
  } finally {
    $('submit').disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  $('submit').addEventListener('click', submit);
  $('reload').addEventListener('click', readPage);
  $('options').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
  readPage();
});
