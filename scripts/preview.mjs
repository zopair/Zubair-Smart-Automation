import {createServer} from "node:http";
import {createReadStream,existsSync,statSync} from "node:fs";
import {extname,join,resolve} from "node:path";
import {resolveStaticPath} from "./static-path.js";

const root=resolve(process.cwd(),"dist");
if(!existsSync(root)){console.error("dist/ is missing. Run npm run build first.");process.exit(1);}
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=createServer((req,res)=>{
  if(req.method!=="GET" && req.method!=="HEAD"){res.writeHead(405,{"Allow":"GET, HEAD"}).end("Method not allowed");return;}
  const pathname=(req.url??"/").split("?")[0];
  const file=resolveStaticPath(root,pathname);
  if(!file){res.writeHead(400).end("Invalid path");return;}
  const candidate=existsSync(file)?file:null;
  const target=candidate && statSync(candidate).isFile()?candidate:pathname.endsWith("/")?join(file,"index.html"):null;
  if(!target || !existsSync(target) || !statSync(target).isFile()){res.writeHead(404).end("Not found");return;}
  res.writeHead(200,{"Content-Type":types[extname(target)]??"application/octet-stream","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
  if(req.method==="HEAD"){res.end();return;}
  createReadStream(target).pipe(res);
});
const port=Number(process.env.PORT)||4173;
server.listen(port,"127.0.0.1",()=>console.log(`Preview: http://127.0.0.1:${port}`));
