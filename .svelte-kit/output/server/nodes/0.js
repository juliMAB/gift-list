import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["entries/pages/_layout.svelte.js","chunks/index.js","chunks/attributes.js","entries/pages/_layout.ts.js"];
export const stylesheets = ["_app/immutable/assets/_layout.BKNpLA5-.css"];
export const fonts = [];
