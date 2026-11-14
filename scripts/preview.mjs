import {createServer} from "node:http";
import {createReadStream,existsSync} from "node:fs";
import {extname,join,normalize} from "node:path";
const root=join(process.cwd(),"dist");
if(!existsSync(root)){console.error("dist/ is missing. Run npm run build first.");process.exit(1);}
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=createServer((req,res)=>{
  const pathname=decodeURIComponent((req.url??"/").split("?")[0]);
  const relative=normalize(pathname).replace(/^([/\\\\])+/, "");
  const file=join(root,relative||"index.html");
  if(!file.startsWith(root)){res.writeHead(403).end("Forbidden");return;}
  const target=existsSync(file)?file:pathname.endsWith("/")?join(root,"index.html"):null;
  if(!target||!existsSync(target)){res.writeHead(404).end("Not found");return;}
  res.writeHead(200,{"Content-Type":types[extname(target)]??"application/octet-stream"});
  createReadStream(target).pipe(res);
});
server.listen(4173,"0.0.0.0",()=>console.log("Preview: http://localhost:4173"));
