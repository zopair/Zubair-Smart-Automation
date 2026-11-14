const PLATFORMS=new Set(["instagram","tiktok","youtube-shorts","facebook"]);
const TONES=new Set(["professional","friendly","energetic","educational"]);
function required(value,max,label){const clean=String(value??"").trim();if(!clean)throw new TypeError(`${label} is required.`);if(clean.length>max)throw new RangeError(`${label} must be ${max} characters or fewer.`);return clean;}
function makeHashtags(values){const seen=new Set(),tags=[];for(const raw of Array.isArray(values)?values.slice(0,12):[]){const clean=String(raw??"").replace(/^#+/,"").trim().replace(/\s+/g,"_").replace(/[^\p{L}\p{N}_]/gu,"").slice(0,30);if(clean&&!seen.has(clean)){seen.add(clean);tags.push("#"+clean);}}return tags;}
export function createShortPlan(input={}){
  const topic=required(input.topic,120,"Topic"),audience=required(input.audience??"الجمهور العام",120,"Audience");
  const platform=input.platform??"instagram";if(!PLATFORMS.has(platform))throw new TypeError("Unsupported platform.");
  const duration=Number(input.duration??30);if(!Number.isInteger(duration)||duration<15||duration>180)throw new RangeError("Duration must be between 15 and 180 seconds.");
  const tone=input.tone??"professional";if(!TONES.has(tone))throw new TypeError("Unsupported tone.");
  const goal=String(input.goal??"التوعية").trim().slice(0,80)||"التوعية";
  const cta=String(input.cta??"اطلب من المشاهد اتخاذ خطوة واحدة واضحة.").trim().slice(0,160)||"اطلب من المشاهد اتخاذ خطوة واحدة واضحة.";
  const hookSeconds=Math.max(2,Math.round(duration*.2)),ctaSeconds=Math.max(2,Math.round(duration*.15)),bodySeconds=duration-hookSeconds-ctaSeconds;
  const voice={professional:"مباشر وواضح",friendly:"قريب وبسيط",energetic:"سريع وحيوي",educational:"تعليمي ومتدرج"}[tone];
  const segments=[
    {name:"الافتتاحية",seconds:hookSeconds,visual:"لقطة قريبة أو حركة بصرية واضحة في أول ثانية",voiceover:`ابدأ بسؤال أو حقيقة قابلة للتحقق ترتبط بموضوع: ${topic}.`},
    {name:"الفكرة الأساسية",seconds:bodySeconds,visual:"اعرض الفكرة على الشاشة مع مثال أو مشهد داعم",voiceover:`اشرح ${topic} للجمهور المستهدف (${audience}) بما يخدم هدف ${goal}. قسّم الشرح إلى نقطتين أو ثلاث، ولا تذكر أرقاماً أو وعوداً إلا إذا كانت موثقة.`},
    {name:"الدعوة إلى الإجراء",seconds:ctaSeconds,visual:"أظهر الدعوة إلى الإجراء كنص واضح على الشاشة",voiceover:cta}
  ];
  const plan={topic,audience,goal,platform,duration,tone,voiceDirection:voice,segments,hashtags:makeHashtags(input.keywords),notes:["استخدم لقطات أو صوراً تملك حق استخدامها.","أضف ترجمة نصية متزامنة مع الصوت.","تحقق من أي معلومة أو رقم قبل النشر.","راجع أبعاد الفيديو وسياسة المنصة قبل التصدير."]};
  plan.script=segments.map(s=>`${s.name} (${s.seconds} ثانية)\n${s.voiceover}`).join("\n\n");
  return Object.freeze(plan);
}
export function buildShortPlanText(plan){
  if(!plan||!Array.isArray(plan.segments))throw new TypeError("A valid short-form plan is required.");
  return [`موضوع الفيديو: ${plan.topic}`,`الجمهور: ${plan.audience}`,`المنصة: ${plan.platform}`,`المدة: ${plan.duration} ثانية`,`اتجاه الأداء: ${plan.voiceDirection}`,"","السيناريو:",plan.script,"","الوسوم:",(plan.hashtags??[]).join(" "), "","ملاحظات الإنتاج:",...(plan.notes??[]).map(note=>"- "+note)].join("\n");
}
