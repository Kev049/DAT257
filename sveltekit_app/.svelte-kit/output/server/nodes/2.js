

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.DFq4ymzl.js","_app/immutable/chunks/scheduler.aZHIKDCl.js","_app/immutable/chunks/index.Bo1vMjmn.js","_app/immutable/chunks/index.Haq8omwQ.js"];
export const stylesheets = [];
export const fonts = [];
