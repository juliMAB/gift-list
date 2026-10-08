import { q as attr, e as escape_html } from "../../chunks/attributes.js";
import "../../chunks/supabase.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let gifts = [];
    let creating = false;
    let title = "";
    let description = "";
    let link = "";
    let price = "";
    let imageUrl = "";
    $$renderer2.push(`<div class="mb-4 rounded-lg border border-slate-200 bg-white p-3 text-sm"><p class="font-medium">Soy el dueño de la lista. Para agregá regalos:</p> <ol class="mt-2 list-decimal space-y-1 pl-5"><li>Pegá el link de lo que quieras y completá los datos de abajo.</li> <li>Querés que la IA lea el link? Usá el botón <strong>"Leer link con IA"</strong>: le das al link y pegás lo que Chopy te devuelva.</li> <li>El link de esta página es el que le mandás a la familia: cualquiera puede ver la lista, solo vos agregás.</li></ol></div> <form class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><h2 class="mb-3 text-lg font-semibold">Agregar regalo</h2> <div class="mb-3 flex gap-2"><input type="url" placeholder="https://..." class="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"${attr("value", link)}/> `);
    {
      $$renderer2.push(`<!--[0--><button type="button" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Leer link con IA</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push(`<!--[-1--><div class="mb-3"><label class="block text-xs font-medium text-slate-700">Título</label> <input type="text" placeholder="Ej: Auriculares Sony WH-1000XM5" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"${attr("value", title)}/></div> <div class="mb-3"><label class="block text-xs font-medium text-slate-700">Descripción</label> <textarea placeholder="Color, talla, modelo, enlaces a reseñas..." class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" rows="2">`);
      const $$body = escape_html(description);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div> <div class="mb-3"><label class="block text-xs font-medium text-slate-700">Precio (opcional)</label> <input type="text" placeholder="Ej: 350 USD" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"${attr("value", price)}/></div> <div class="mb-3"><label class="block text-xs font-medium text-slate-700">Link de la foto (opcional)</label> <input type="url" placeholder="https://..." class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"${attr("value", imageUrl)}/></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button type="submit"${attr("disabled", creating, true)} class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">${escape_html("Agregar a la lista")}</button></form> <h2 class="mt-6 text-lg font-semibold">Mi lista de regalos (${escape_html(gifts.length)})</h2> `);
    {
      $$renderer2.push(`<!--[0--><p class="py-8 text-center text-sm text-slate-500">Cargando...</p>`);
    }
    $$renderer2.push(`<!--]--> <div class="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm"><p class="font-medium text-indigo-900">Link público de la lista:</p> <div class="mt-1 flex items-center gap-2"><code class="flex-1 truncate rounded bg-white px-2 py-1 text-xs">${escape_html(location.origin)}</code> <button class="rounded bg-white px-2 py-1 text-xs hover:bg-indigo-100">Copiar</button></div> <p class="mt-1 text-xs text-indigo-700">Mandá ese link a tu familia. Ellos pueden ver todo, pero solo vos podés agregar regalos.</p></div>`);
  });
}
export {
  _page as default
};
