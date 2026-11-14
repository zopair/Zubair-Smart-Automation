const registry = new Map();
export function registerTool(tool) {
  if (!tool || typeof tool.id!=="string" || !tool.id.trim()) throw new TypeError("Tool must have a non-empty id.");
  if (typeof tool.mount!=="function") throw new TypeError("Tool must provide a mount function.");
  if (registry.has(tool.id)) throw new Error(`Tool already registered: ${tool.id}`);
  registry.set(tool.id,Object.freeze({...tool}));
}
export function getTool(id) { return registry.get(id) ?? null; }
export function listTools() { return [...registry.values()].map(({id,label,description})=>({id,label,description})); }
