import { O as slot } from "../../chunks/index.js";
function _layout($$renderer, $$props) {
  $$renderer.push(`<main class="min-h-screen"><div class="mx-auto max-w-xl px-4 py-6"><header class="mb-6 text-center"><h1 class="text-2xl font-bold tracking-tight text-slate-900">Mi lista de regalos 🎁</h1> <p class="mt-1 text-sm text-slate-600">Hola! ya se acerca mi cumpleaños. Si querés saber qué me gustaría regalarme, mirá la lista de abajo o agregá algo de tu elección.</p></header> <!--[-->`);
  slot($$renderer, $$props, "default", {});
  $$renderer.push(`<!--]--></div></main>`);
}
export {
  _layout as default
};
