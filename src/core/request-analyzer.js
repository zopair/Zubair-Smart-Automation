const INTENTS = [
  { id:"task-manager", label:"إدارة المهام", description:"قالب محلي لإضافة المهام ومتابعتها وتخزينها على هذا الجهاز.", keywords:["مهمة","مهام","فريق","مشروع","متابعة","task","project","team"] },
  { id:"mini-store", label:"متجر مصغر", description:"متجر محلي لإدارة المنتجات والمخزون والسلة وتجهيز طلبات واتساب.", keywords:["متجر","متجر مصغر","منتج","منتجات","سلة","بيع","شراء","كتالوج","store","product","cart","shop"] },
  { id:"shorts-content", label:"محتوى الشورتز", description:"قالب لتخطيط أفكار الفيديوهات القصيرة والنصوص.", keywords:["فيديو","شورت","ريلز","محتوى","هاشتاج","shorts","reels","video"] },
  { id:"source-catalog", label:"كتالوج الأدوات والمصادر", description:"بحث في مستودعات وأدوات تقنية مع مراجعة أولية للتراخيص.", keywords:["مصادر","مستودع","مستودعات","ترخيص","تراخيص","أدوات مجانية","كتالوج","github","repository","license","catalog"] },
  { id:"agent-workflow", label:"مركز سير عمل الوكلاء", description:"تجهيز خطوات محلية مسموح بها واعتمادها قبل التنفيذ.", keywords:["وكيل","وكلاء","وكيل ذكي","وكلاء ذكيون","سير عمل","اعتماد","agent","agents","workflow"] }
];
export function analyzeRequest(input) {
  const normalized = String(input ?? "").trim().toLocaleLowerCase("ar");
  if (!normalized) return { intent:"unknown", confidence:0, label:"وصف مطلوب", description:"اكتب وصفاً مختصراً للأداة التي تريدها." };
  const ranked = INTENTS.map(item => ({...item,score:item.keywords.reduce((n,word)=>n+(normalized.includes(word)?1:0),0)})).sort((a,b)=>b.score-a.score);
  const best = ranked[0];
  if (!best || best.score===0) return {intent:"unknown",confidence:0,label:"نحتاج توضيحاً",description:"لم يتحدد قالب مناسب بعد. وضّح النتيجة التي تريد أن تحققها الأداة."};
  const total=ranked.reduce((sum,item)=>sum+item.score,0);
  return {intent:best.id,confidence:Number((best.score/total).toFixed(2)),label:best.label,description:best.description};
}
