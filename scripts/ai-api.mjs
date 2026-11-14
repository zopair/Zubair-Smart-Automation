const ALLOWED_PLATFORMS=new Set(["instagram","tiktok","youtube-shorts","facebook"]);
const ALLOWED_TONES=new Set(["professional","friendly","energetic","educational"]);
const DEFAULT_API_URL="https://api.openai.com/v1/chat/completions";
function json(res,status,body){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});res.end(JSON.stringify(body));}
function clean(value,max,label,required=false){const text=String(value??"").trim();if(required&&!text)throw new TypeError(`${label} is required.`);if(text.length>max)throw new RangeError(`${label} is too long.`);return text;}
function extractText(body){
 const content=body?.choices?.[0]?.message?.content;
 if(typeof content==="string")return content.trim();
 if(Array.isArray(content))return content.map(item=>item?.text??"").join("\n").trim();
 return "";
}
async function readBody(req,maxBytes){
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>maxBytes)throw Object.assign(new Error("Request body too large."),{status:413});chunks.push(chunk);}
 try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}catch{throw Object.assign(new Error("Request body must be valid JSON."),{status:400});}
}
function validatePayload(body){
 if(body?.task!=="shorts-script")throw Object.assign(new Error("Unsupported generation task."),{status:400});
 const input=body.payload??{};
 const topic=clean(input.topic,120,"Topic",true),audience=clean(input.audience,120,"Audience",true),cta=clean(input.cta,160,"CTA");
 const platform=String(input.platform??"");if(!ALLOWED_PLATFORMS.has(platform))throw Object.assign(new Error("Unsupported platform."),{status:400});
 const duration=Number(input.duration);if(!Number.isInteger(duration)||duration<15||duration>180)throw Object.assign(new Error("Duration must be between 15 and 180 seconds."),{status:400});
 const tone=String(input.tone??"professional");if(!ALLOWED_TONES.has(tone))throw Object.assign(new Error("Unsupported tone."),{status:400});
 const keywords=Array.isArray(input.keywords)?input.keywords.slice(0,8).map(value=>clean(value,40,"Keyword")):[];
 return {topic,audience,cta,platform,duration,tone,keywords};
}
function createPrompt(payload){
 return [
  "أنت مساعد تحرير محتوى فيديو قصير. اكتب مسودة عربية واضحة قابلة للمراجعة.",
  "لا تخترع إحصاءات أو حقائق أو شهادات أو نتائج أو وعوداً. إذا احتاج الموضوع معلومة غير مقدمة، ضع [تحقق من المعلومة] بدلاً من اختلاقها.",
  "أخرج: عنواناً، افتتاحية قوية غير مضللة، سيناريو متدرجاً بتوقيت تقريبي، نصوصاً قصيرة على الشاشة، دعوة للإجراء، واقتراحات لقطات.",
  "اكتب بأسلوب عملي ومناسب للمنصة والمدة المحددتين. لا تضف وسوماً إلا من الكلمات التي قدمها المستخدم.",
  JSON.stringify(payload)
 ].join("\n\n");
}
export function createAiApiHandler({env=process.env,fetchImpl=globalThis.fetch,now=()=>Date.now(),maxRequestsPerMinute=10,maxBodyBytes=16384}={}){
 const requests=new Map();
 return async function handleAiApi(req,res){
  const pathname=new URL(req.url??"/","http://localhost").pathname;
  if(pathname!=="/api/health"&&pathname!=="/api/generate")return false;
  const origin=req.headers.origin,host=req.headers.host;
  if(origin){try{if(new URL(origin).host!==host){json(res,403,{error:"Cross-origin requests are not allowed."});return true;}}catch{json(res,403,{error:"Invalid request origin."});return true;}}
  const configured=Boolean(env.AI_API_KEY&&env.AI_MODEL);
  if(pathname==="/api/health"){
   if(req.method!=="GET"){json(res,405,{error:"Method not allowed."});return true;}
   json(res,200,{available:configured,provider:configured?"openai-compatible":null});return true;
  }
  if(req.method!=="POST"){json(res,405,{error:"Method not allowed."});return true;}
  if(!configured){json(res,503,{error:"AI provider is not configured on the server."});return true;}
  const ip=req.socket.remoteAddress??"unknown",time=now(),recent=(requests.get(ip)??[]).filter(stamp=>time-stamp<60000);
  if(recent.length>=maxRequestsPerMinute){json(res,429,{error:"Rate limit exceeded. Try again shortly."});return true;}
  recent.push(time);requests.set(ip,recent);
  try{
   if(!String(req.headers["content-type"]??"").includes("application/json"))throw Object.assign(new Error("Content-Type must be application/json."),{status:415});
   const body=await readBody(req,maxBodyBytes),payload=validatePayload(body);
   const apiUrl=new URL(env.AI_API_URL||DEFAULT_API_URL);
   if(apiUrl.protocol!=="https:"&&!(apiUrl.protocol==="http:"&&["localhost","127.0.0.1","[::1]"].includes(apiUrl.hostname)))throw Object.assign(new Error("AI_API_URL must use HTTPS except for loopback development."),{status:500});
   const response=await fetchImpl(apiUrl,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${env.AI_API_KEY}`},body:JSON.stringify({model:env.AI_MODEL,messages:[{role:"system",content:"اكتب محتوى دقيقاً ولا تختلق حقائق."},{role:"user",content:createPrompt(payload)}],temperature:0.7,max_tokens:1400}),signal:AbortSignal.timeout(45000)});
   if(!response.ok){json(res,502,{error:"The configured AI provider returned an error."});return true;}
   const result=await response.json(),text=extractText(result);
   if(!text||text.length>12000){json(res,502,{error:"The AI provider returned an empty or oversized response."});return true;}
   json(res,200,{text});
  }catch(error){json(res,error?.status??(error?.name==="TimeoutError"?504:500),{error:error?.status?error.message:"AI generation failed. Check server configuration and provider availability."});}
  return true;
 };
}
