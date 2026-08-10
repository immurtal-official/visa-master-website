/* Screen copy for the marketing kit, in both shipped languages. Chinese is the source;
   the English is here so the layouts get exercised against 40–60% longer strings. */
const PACK_ZH = [
  { id: "s1", name: "从这里开始", children: [
    { id: "f1", name: "打印与递交清单.pdf", kind: "pdf", language: "zh-CN", status: "ready" },
    { id: "f1b", name: "面签当天带什么.pdf", kind: "pdf", language: "zh-CN", status: "ready" }] },
  { id: "s2", name: "官方文件", count: 4, children: [
    { id: "f2", name: "申根签证申请表（已填）.pdf", kind: "pdf", language: "fr", status: "ready" },
    { id: "f3", name: "使馆材料清单（原件）.pdf", kind: "pdf", language: "fr", status: "official" }] },
  { id: "s3", name: "可编辑模板", children: [
    { id: "f4", name: "在职证明（模板）.docx", kind: "doc", language: { code: "zh-CN", name: "中文 / English" }, status: "review" },
    { id: "f5", name: "行程说明（模板）.docx", kind: "doc", language: { code: "zh-CN", name: "中文 / English" }, status: "ready" }] },
  { id: "s4", name: "本人材料", children: [
    { id: "f6", name: "护照资料页.jpg", kind: "img", language: { code: "zh-CN", name: "中文 / English" }, status: "ready" },
    { id: "f7", name: "银行流水.pdf", kind: "pdf", language: "zh-CN", status: "waiting" }] },
  { id: "s5", name: "来源与提醒", children: [
    { id: "f8", name: "本次材料的官方来源", kind: "link", language: "zh-CN", status: "ready" }] },
];
const PACK_EN = [
  { id: "s1", name: "Start here", children: [
    { id: "f1", name: "Printing and submission checklist.pdf", kind: "pdf", language: "zh-CN", status: "ready" },
    { id: "f1b", name: "What to bring on the day.pdf", kind: "pdf", language: "zh-CN", status: "ready" }] },
  { id: "s2", name: "Official documents", count: 4, children: [
    { id: "f2", name: "Schengen application form (completed).pdf", kind: "pdf", language: "fr", status: "ready" },
    { id: "f3", name: "Consulate document list (original).pdf", kind: "pdf", language: "fr", status: "official" }] },
  { id: "s3", name: "Editable templates", children: [
    { id: "f4", name: "Employment letter (template).docx", kind: "doc", language: { code: "zh-CN", name: "中文 / English" }, status: "review" },
    { id: "f5", name: "Itinerary statement (template).docx", kind: "doc", language: { code: "zh-CN", name: "中文 / English" }, status: "ready" }] },
  { id: "s4", name: "Your own documents", children: [
    { id: "f6", name: "Passport data page.jpg", kind: "img", language: { code: "zh-CN", name: "中文 / English" }, status: "ready" },
    { id: "f7", name: "Bank statement.pdf", kind: "pdf", language: "zh-CN", status: "waiting" }] },
  { id: "s5", name: "Sources and caveats", children: [
    { id: "f8", name: "Official sources for this pack", kind: "link", language: "zh-CN", status: "ready" }] },
];

const HOME_TEXT = {
  "zh-CN": {
    nav: [{ label: "支持路线" }, { label: "材料包内容" }, { label: "价格" }, { label: "常见问题" }],
    menu: "菜单",
    cta: "开始准备材料",
    secondaryCta: "查看支持路线",
    badge: "申根 · 英国 · 日本 · 美国 B1/B2",
    title: "更清楚地准备你的签证材料包",
    lede: "回答一组结构化问题，上传证件与银行流水。我们对照官方要求生成材料，交叉校验日期、城市与在职信息，人工复核后交给你一份可以直接打印递交的材料包。",
    trust: [
      { label: "官方来源核对", icon: "book-open-text" },
      { label: "材料自动生成", icon: "file-text" },
      { label: "一致性校验", icon: "git-compare-arrows" },
      { label: "人工复核后交付", icon: "user-check" }],
    packHeader: "你会拿到这样一份材料包",
    packFoot: "示例：法国短期旅游签证 · 共 14 份文件",
    pack: PACK_ZH,
    howTitle: "三步，全程都能看到进度",
    steps: [
      { n: "1", t: "回答一组问题", d: "一次一个问题，每题都写清楚为什么要问。填到一半可以关掉，链接还在。" },
      { n: "2", t: "上传证件与流水", d: "护照、银行流水、在职材料。手机可以连拍多页，中断了会从断点继续。" },
      { n: "3", t: "拿到可打印的材料包", d: "机器生成、交叉校验，再由人工复核一遍，最后交给你一份可以直接打印的文件夹。" }],
    consistencyTitle: "被拒的常见原因，是材料之间对不上",
    consistencyBody: "在职证明写的入职日期和社保记录差两个月；机票订的是巴黎，酒店订在里昂。这些不是大错，但需要在递交前解释清楚。我们把材料之间的每一处出入列出来，并写明该怎么处理。",
    consistencyNote: "校验只做对照，不替你判断真伪，也不会修改你上传的原件。",
    consistencySummary: "示例：共检查 42 项，2 项需要确认。",
    checks: [
      { id: "c1", field: "在职起始日期", severity: "conflict",
        readings: [{ source: "在职证明", value: "2021-03-01" }, { source: "社保记录", value: "2021-05-01" }],
        action: "两处日期不一致。请以社保记录为准，或让公司出具一份更正说明。" },
      { id: "c2", field: "出行城市", severity: "check",
        readings: [{ source: "机票预订", value: "巴黎 CDG" }, { source: "住宿预订", value: "里昂" }],
        action: "行程里没有说明从巴黎去里昂的方式。补一张火车票或在行程说明里写清楚。" },
      { id: "c3", field: "护照有效期", severity: "pass",
        readings: [{ source: "护照资料页", value: "2031-04-18" }, { source: "计划返程", value: "2026-09-14" }] }],
    sourcesTitle: "每一条要求，都写清楚出处",
    sourcesBody: "材料包里每一份文件都附上依据的官方页面和核对日期。我们也会写明哪些事我们不做：不代办、不承诺结果、不替你联系使领馆。",
    sources: [
      { title: "法国驻华使馆 · 短期签证材料清单", publisher: "France-Visas", url: "france-visas.gouv.fr", quote: "银行对账单需覆盖最近三个月。" },
      { title: "申根签证通用要求", publisher: "European Commission", url: "ec.europa.eu" }],
    caveats: ["最终是否受理与批准由使领馆决定，本服务不代办、不承诺结果。", "官方要求可能随时调整，交付前我们会再核对一次。"],
    ctaTitle: "先看看需要准备什么，再决定",
    ctaBody: "前面的问题不收费，看到完整清单后再付款。",
    footerNote: "本服务不代办签证，也不影响使领馆的审批结果。",
    footerCols: [
      { title: "服务", links: ["申根签证", "英国签证", "日本签证", "美国 B1/B2"] },
      { title: "材料包", links: ["包含哪些文件", "一致性校验", "人工复核", "退款说明"] },
      { title: "帮助", links: ["常见问题", "联系我们", "隐私与数据"] }],
  },
  en: {
    nav: [{ label: "Supported routes" }, { label: "What's in the pack" }, { label: "Pricing" }, { label: "Common questions" }],
    menu: "Menu",
    cta: "Start preparing my documents",
    secondaryCta: "See supported routes",
    badge: "Schengen · UK · Japan · US B1/B2",
    title: "Prepare your visa document pack with less guesswork",
    lede: "Answer a structured set of questions and upload your passport and bank statement. We build the documents against the official requirements, cross-check dates, cities and employment details, and hand you a human-reviewed pack you can print and submit as it is.",
    trust: [
      { label: "Checked against official sources", icon: "book-open-text" },
      { label: "Documents generated for you", icon: "file-text" },
      { label: "Cross-document consistency check", icon: "git-compare-arrows" },
      { label: "Delivered after human review", icon: "user-check" }],
    packHeader: "This is the pack you receive",
    packFoot: "Example: French short-stay tourist visa · 14 documents",
    pack: PACK_EN,
    howTitle: "Three steps, and you can see the progress the whole way",
    steps: [
      { n: "1", t: "Answer a set of questions", d: "One question at a time, each explaining why it is being asked. Stop halfway and the link back keeps working." },
      { n: "2", t: "Upload documents and statements", d: "Passport, bank statement, employment paperwork. On a phone you can photograph several pages in a row, and an interrupted upload resumes." },
      { n: "3", t: "Receive a pack you can print", d: "Generated, cross-checked, then reviewed by a person before you get a folder that is ready to print." }],
    consistencyTitle: "Most refusals come from documents that disagree with each other",
    consistencyBody: "The employment letter says one start date and the social-insurance record says another, two months apart. The flight lands in Paris and the hotel is in Lyon. None of this is serious, but it has to be explained before you submit. We list every disagreement between your documents and say what to do about each one.",
    consistencyNote: "The check compares documents. It does not judge whether they are genuine, and it never edits the originals you uploaded.",
    consistencySummary: "Example: 42 items checked, 2 need confirming.",
    checks: [
      { id: "c1", field: "Employment start date", severity: "conflict",
        readings: [{ source: "Employment letter", value: "2021-03-01" }, { source: "Social insurance record", value: "2021-05-01" }],
        action: "The two dates disagree. Use the social-insurance date, or ask your employer for a short correction letter." },
      { id: "c2", field: "Destination city", severity: "check",
        readings: [{ source: "Flight booking", value: "Paris CDG" }, { source: "Accommodation", value: "Lyon" }],
        action: "Your itinerary does not say how you travel from Paris to Lyon. Add a train ticket, or explain it in the itinerary statement." },
      { id: "c3", field: "Passport validity", severity: "pass",
        readings: [{ source: "Passport data page", value: "2031-04-18" }, { source: "Planned return", value: "2026-09-14" }] }],
    sourcesTitle: "Every requirement says where it came from",
    sourcesBody: "Each document in the pack carries the official page it is based on and the date we checked it. We also write down what we do not do: we are not an agency, we make no promise about the outcome, and we never contact the consulate for you.",
    sources: [
      { title: "French Embassy in China · short-stay document list", publisher: "France-Visas", url: "france-visas.gouv.fr", quote: "Bank statements must cover the last three months." },
      { title: "General Schengen visa requirements", publisher: "European Commission", url: "ec.europa.eu" }],
    caveats: ["The consulate decides whether to accept and approve your application. We are not an agency and promise no outcome.", "Official requirements can change at any time. We check them again before we deliver."],
    ctaTitle: "See what you need to prepare, then decide",
    ctaBody: "The questions are free. You pay after you have seen the full list.",
    footerNote: "We are not a visa agency, and we have no influence on the consulate's decision.",
    footerCols: [
      { title: "Services", links: ["Schengen visa", "UK visa", "Japan visa", "US B1/B2"] },
      { title: "The pack", links: ["What is included", "Consistency check", "Human review", "Refunds"] },
      { title: "Help", links: ["Common questions", "Contact us", "Privacy and data"] }],
  },
};

Object.assign(window, { HOME_TEXT });
