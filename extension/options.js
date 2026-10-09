const DEFAULTS = {
  supabaseUrl: 'https://piuuwzgodcfoybznmcba.supabase.co',
  anonKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdXV3emdvZGNmb3liem5tY2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODkwMDgsImV4cCI6MjEwNzA2NTAwOH0.gSHcRt_8IayRD9_k7Sl2pKc7uiRLuwagNarKkkyuP_g',
  appUrl: 'https://gift-list-beige.vercel.app'
};

const $ = (id) => document.getElementById(id);

async function load() {
  const s = await chrome.storage.sync.get(['supabaseUrl', 'anonKey', 'appUrl']);
  $('supabaseUrl').value = s.supabaseUrl || DEFAULTS.supabaseUrl;
  $('anonKey').value = s.anonKey || DEFAULTS.anonKey;
  $('appUrl').value = s.appUrl || DEFAULTS.appUrl;
}

async function save() {
  await chrome.storage.sync.set({
    supabaseUrl: $('supabaseUrl').value.trim().replace(/\/+$/, ''),
    anonKey: $('anonKey').value.trim(),
    appUrl: $('appUrl').value.trim().replace(/\/+$/, '')
  });
  $('msg').textContent = 'Guardado.';
  setTimeout(() => ($('msg').textContent = ''), 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  $('save').addEventListener('click', save);
  load();
});
