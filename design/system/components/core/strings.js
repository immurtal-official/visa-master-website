/* The string catalogue. THE ONLY place user-facing copy is allowed to live.
   Chinese is the source language; every key must exist in every locale listed in
   LOCALES with the same {placeholders}. A missing key is a build failure, not a
   silent fallback — see .build/check-i18n.mjs.

   Plurals: define <key>_one and <key>_other and call t(key, { count }).
   Proper nouns that are never translated (language self-names) live in languages.js. */

export const LOCALES = ["zh-CN", "en"];

/* Consumer-registered strings live OUTSIDE this module, on the host global, because the
   bundle can re-execute (hot reload, a second <script>, a re-bound design system) and a
   fresh CATALOGUE would otherwise drop everything a consumer had added — while the
   consumer's own "already registered" flag stayed latched and never re-registered. The
   store survives re-execution and is merged back in below, so extension is the system's
   problem, not the consumer's. */
const STORE_KEY = "__visaMasterI18nExtra__";
const STORE = (globalThis[STORE_KEY] = globalThis[STORE_KEY] || {});

export const CATALOGUE = {
  "zh-CN": {
    "common.close": "关闭",
    "common.copy": "复制链接",
    "common.copied": "已复制",
    "language.groupLabel": "界面语言",
    "language.note": "仅切换界面语言。材料包内文件用哪种语言，由目的地国家的要求决定。",
    "nav.back": "返回上一步",
    "nav.menu": "菜单",
    "date.year": "年",
    "date.month": "月",
    "date.day": "日",
    "errorSummary.title": "请先补充以下内容",
    "progress.stepOfTotal": "第 {step} / {total} 步",
    "save.justNow": "刚刚",
    "save.saved": "已保存（{when}）。你可以随时关闭页面，之后继续填写。",
    "save.sendLink": "把续填链接发到 {email}",
    "save.sendLinkNoEmail": "把续填链接发到邮箱",
    "camera.guide": "把整页放进取景框，四个角都要在框内",
    "camera.page": "第 {n} 页",
    "camera.capture": "拍摄这一页",
    "camera.deletePage": "删除第 {n} 页",
    "camera.moveEarlier": "前移",
    "camera.moveLater": "后移",
    "camera.captured": "已拍 {n} 页",
    "camera.reorderHint": "长按拖动可调整顺序",
    "citations.title": "来源与提醒",
    "citations.checkedAt": "核对于 {date}",
    "consistency.conflict": "需要确认",
    "consistency.check": "建议核对",
    "consistency.pass": "一致",
    "consistency.fix": "去修改",
    "file.printA4": "A4 单面打印，黑白即可",
    "file.pages_one": "{count} 页",
    "file.pages_other": "{count} 页",
    "upload.hint": "支持 JPG、PNG、PDF，单个文件不超过 20MB",
    "upload.dropzone": "把文件拖到这里，或点击选择",
    "upload.resumeNote": "上传中断后会从断点继续，不用重新开始",
    "upload.resume": "继续上传",
    "upload.interrupted": "网络中断，已保留 {progress}%。点“继续上传”接着传。",
    "upload.replace": "替换",
    "upload.upload": "上传",
    "uploadState.done": "已收到",
    "uploadState.checking": "识别中",
    "uploadState.todo": "待上传",
    "uploadState.redo": "需要重传",
    "uploadState.optional": "可选",
    "packStatus.ready": "已生成",
    "packStatus.review": "人工复核中",
    "packStatus.waiting": "待你补充",
    "packStatus.official": "官方原件",
    "packTree.languageNote": "每份文件都标注了它自己的语言。文件语言由目的地国家决定，与你正在阅读的界面语言无关。",
    "packTree.languageAria": "文件语言：{language}",
    "packTree.languageUnknown": "语言待定",
    "wechat.title": "请在浏览器中打开",
    "wechat.body.payment": "微信内无法完成支付。点右上角的“···”，选择“在浏览器中打开”，支付页会带着你的进度一起打开。",
    "wechat.body.download": "微信内无法下载文件。点右上角的“···”，选择“在浏览器中打开”，材料包会带着你的进度一起打开。",
    "wechat.body.alipay": "微信内无法跳转支付宝。点右上角的“···”，选择“在浏览器中打开”，再回来付款。",
    "wechat.hint": "找不到“···”？它在屏幕右上角。",
    "wechat.tokenNote": "链接里带着一次性登录凭证，{minutes} 分钟内有效，只能用一次。不要转发给别人。",
    "wechat.dismiss": "我知道了",
    "handoff.title.continue": "换一台设备继续",
    "handoff.title.camera": "用手机拍摄",
    "handoff.body.continue": "扫码或打开链接，进度会一起带过去。这台设备可以继续用，不会掉线。",
    "handoff.body.camera": "用手机扫码拍摄，照片会直接出现在这个页面上，不用再传一次。",
    "handoff.codeLabel": "手动输入码",
    "handoff.codeHint": "在另一台设备上打开 {url}，输入上面的码。",
    "handoff.expires": "二维码 {minutes} 分钟内有效",
    "handoff.waiting": "等待另一台设备连接…",
    "handoff.connected": "已连接：{device}",
    "handoff.qrPlaceholder": "二维码",
    "pipeline.title": "材料包生成进度",
    "pipeline.stageOf": "第 {n} / {total} 阶段",
    "pipeline.stage.sources": "官方来源核对",
    "pipeline.stage.generate": "材料生成",
    "pipeline.stage.consistency": "一致性检查",
    "pipeline.stage.review": "人工复核",
    "pipeline.state.done": "已完成",
    "pipeline.state.active": "进行中",
    "pipeline.state.pending": "等待中",
    "pipeline.state.blocked": "需要你处理",
    "pipeline.eta": "预计还需 {minutes} 分钟",
    "pipeline.leaveNote": "可以关闭页面。完成后我们会用邮件和短信通知你，链接还是这一个。",
    "tasklist.summary": "已完成 {done} / {total} 个部分",
    "tasklist.state.done": "已完成",
    "tasklist.state.progress": "进行中",
    "tasklist.state.todo": "未开始",
    "tasklist.state.locked": "暂不可填",
    "tasklist.state.problem": "需要修改",
    "tasklist.lockedHint": "完成“{section}”之后才能填这一部分。",
    "tasklist.itemsDone": "{done} / {total}",
  },
  en: {
    "common.close": "Close",
    "common.copy": "Copy link",
    "common.copied": "Copied",
    "language.groupLabel": "Interface language",
    "language.note": "Changes the interface language only. The language of the documents in your pack is set by the destination country’s requirements.",
    "nav.back": "Back to the previous step",
    "nav.menu": "Menu",
    "date.year": "Year",
    "date.month": "Month",
    "date.day": "Day",
    "errorSummary.title": "There is something to fix before you continue",
    "progress.stepOfTotal": "Step {step} of {total}",
    "save.justNow": "just now",
    "save.saved": "Saved {when}. You can close this page and pick up where you left off.",
    "save.sendLink": "Send the resume link to {email}",
    "save.sendLinkNoEmail": "Email me the resume link",
    "camera.guide": "Fit the whole page in the frame, all four corners inside",
    "camera.page": "Page {n}",
    "camera.capture": "Capture this page",
    "camera.deletePage": "Delete page {n}",
    "camera.moveEarlier": "Move earlier",
    "camera.moveLater": "Move later",
    "camera.captured": "{n} pages captured",
    "camera.reorderHint": "Press and hold a page to drag it into order",
    "citations.title": "Sources and caveats",
    "citations.checkedAt": "Checked {date}",
    "consistency.conflict": "Needs confirming",
    "consistency.check": "Worth checking",
    "consistency.pass": "Consistent",
    "consistency.fix": "Fix this",
    "file.printA4": "Print A4, single-sided; black and white is fine",
    "file.pages_one": "{count} page",
    "file.pages_other": "{count} pages",
    "upload.hint": "JPG, PNG and PDF. Up to 20MB per file.",
    "upload.dropzone": "Drag your files here, or click to choose",
    "upload.resumeNote": "If the upload is interrupted it resumes where it stopped — you do not start again.",
    "upload.resume": "Resume upload",
    "upload.interrupted": "Connection dropped at {progress}%. Choose “Resume upload” to carry on.",
    "upload.replace": "Replace",
    "upload.upload": "Upload",
    "uploadState.done": "Received",
    "uploadState.checking": "Reading it now",
    "uploadState.todo": "Not uploaded yet",
    "uploadState.redo": "Needs re-uploading",
    "uploadState.optional": "Optional",
    "packStatus.ready": "Generated",
    "packStatus.review": "In human review",
    "packStatus.waiting": "Waiting on you",
    "packStatus.official": "Official original",
    "packTree.languageNote": "Every file is labelled with its own language. The destination country sets that language; it is not the language you are reading the interface in.",
    "packTree.languageAria": "Document language: {language}",
    "packTree.languageUnknown": "Language to be confirmed",
    "wechat.title": "Open this page in your browser",
    "wechat.body.payment": "Payment cannot be completed inside WeChat. Tap “···” at the top right and choose “Open in Browser”. The payment page opens with your progress intact.",
    "wechat.body.download": "Files cannot be downloaded inside WeChat. Tap “···” at the top right and choose “Open in Browser”. Your pack opens with your progress intact.",
    "wechat.body.alipay": "WeChat will not hand off to Alipay. Tap “···” at the top right, choose “Open in Browser”, then come back to pay.",
    "wechat.hint": "Cannot find “···”? It is in the top-right corner of the screen.",
    "wechat.tokenNote": "The link carries a one-time sign-in token. It is valid for {minutes} minutes, works once, and should not be forwarded.",
    "wechat.dismiss": "Got it",
    "handoff.title.continue": "Continue on another device",
    "handoff.title.camera": "Use your phone as the camera",
    "handoff.body.continue": "Scan the code or open the link. Your progress travels with it, and this device stays signed in.",
    "handoff.body.camera": "Scan with your phone and shoot there. The photos appear on this page as you take them.",
    "handoff.codeLabel": "Type this code instead",
    "handoff.codeHint": "Open {url} on the other device and enter the code above.",
    "handoff.expires": "The code is valid for {minutes} minutes",
    "handoff.waiting": "Waiting for the other device…",
    "handoff.connected": "Connected: {device}",
    "handoff.qrPlaceholder": "QR code",
    "pipeline.title": "Pack progress",
    "pipeline.stageOf": "Stage {n} of {total}",
    "pipeline.stage.sources": "Checking official sources",
    "pipeline.stage.generate": "Generating your documents",
    "pipeline.stage.consistency": "Consistency check",
    "pipeline.stage.review": "Human review",
    "pipeline.state.done": "Done",
    "pipeline.state.active": "In progress",
    "pipeline.state.pending": "Waiting",
    "pipeline.state.blocked": "Needs you",
    "pipeline.eta": "About {minutes} minutes left",
    "pipeline.leaveNote": "You can close this page. We will email and text you when it is ready, using this same link.",
    "tasklist.summary": "You have completed {done} of {total} sections",
    "tasklist.state.done": "Completed",
    "tasklist.state.progress": "In progress",
    "tasklist.state.todo": "Not started",
    "tasklist.state.locked": "Cannot start yet",
    "tasklist.state.problem": "Needs fixing",
    "tasklist.lockedHint": "Available once you finish “{section}”.",
    "tasklist.itemsDone": "{done} / {total}",
  },
};

function merge(locale, table) {
  CATALOGUE[locale] = Object.assign(CATALOGUE[locale] || {}, table);
  if (!LOCALES.includes(locale)) LOCALES.push(locale);
}

/* Re-apply anything registered before this (re-)execution. */
for (const locale of Object.keys(STORE)) merge(locale, STORE[locale]);

/**
 * Add or override catalogue entries from a consuming app.
 *
 *   registerStrings("zh-CN", { "checkout.title": "\u786e\u8ba4\u8ba2\u5355" });
 *   registerStrings("en", { "checkout.title": "Confirm your order" });
 *   registerStrings({ "zh-CN": {\u2026}, en: {\u2026} });        // both at once
 *
 * Safe to call repeatedly and safe across bundle re-execution: the entries are held on the
 * host global and re-merged whenever this module runs again. A new locale tag also joins
 * LOCALES. Registering a key in one locale but not another warns \u2014 consumer strings are not
 * covered by .build/check-i18n.mjs, so this is the only guard they get.
 */
export function registerStrings(locale, table) {
  if (locale && typeof locale === "object") {
    for (const l of Object.keys(locale)) registerStrings(l, locale[l]);
    return;
  }
  if (typeof locale !== "string" || !locale) throw new Error("[visa-master i18n] registerStrings needs a locale tag");
  if (!table || typeof table !== "object") throw new Error(`[visa-master i18n] registerStrings("${locale}", table) needs a table of strings`);
  STORE[locale] = Object.assign(STORE[locale] || {}, table);
  merge(locale, table);
  for (const key of Object.keys(table)) {
    const missing = LOCALES.filter((l) => (CATALOGUE[l] || {})[key] === undefined);
    if (missing.length) console.warn(`[visa-master i18n] "${key}" is registered for ${locale} but missing from ${missing.join(", ")} \u2014 t() will throw in ${missing[0]}.`);
  }
}
