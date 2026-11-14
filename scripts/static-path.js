import {resolve,sep} from "node:path";

export function resolveStaticPath(root,pathname) {
  let decoded;
  try { decoded=decodeURIComponent(pathname); } catch { return null; }
  if (typeof decoded!=="string" || decoded.includes("\0") || decoded.includes("\\")) return null;
  const base=resolve(root);
  const target=resolve(base,`.${decoded.startsWith("/")?decoded:`/${decoded}`}`);
  return target===base || target.startsWith(base+sep) ? target : null;
}
