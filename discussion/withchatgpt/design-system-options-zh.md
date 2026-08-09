
## 2. 做产品设计时，除了用户画像，还要产出什么？

用户画像只是第一步。真正做网站和软件开发，至少还需要这些东西：

| 产出物 | 作用 |
|---|---|
| **用户旅程图** | 用户从“想办签证”到“收到材料包”每一步怎么走 |
| **核心任务流** | 例如选择目的地 → 填个人信息 → 上传材料 → AI 生成 → 人工审核 → 下载 |
| **信息架构** | 网站有哪些页面：Home、Pricing、Start Application、Dashboard、Application Detail、Document Center、Help |
| **服务蓝图** | 前台用户看到什么，后台 AI/人工审核/支付/通知怎么配合 |
| **MVP 范围** | 第一版只做哪些路线、哪些签证类型、哪些材料 |
| **内容策略** | 网站怎么解释“AI + 人审 + 官方来源”，用什么语言建立信任 |
| **风险与合规说明** | PII、护照、银行流水、数据保留、删除、人工审核边界 |
| **状态机设计** | Draft、Submitted、Researching、Generating、Human Review、Ready、Needs Info |
| **错误/补材料流程** | 材料不够、信息矛盾、用户填错、AI 不确定时怎么处理 |
| **Design system / UI kit 选择** | 用什么组件库和视觉语言落地 |

尤其对 Visa Master 来说，“状态机设计”和“服务蓝图”很重要。因为你不是普通内容网站，而是一个“用户提交资料 → AI/系统处理 → 人工审核 → 交付成果”的工作流产品。你文档里也明确说，可信后端应该拥有用户、支付、数据和 workflow 状态，LLM 不决定业务规则。

## 3. Visa Master 应该追求什么网站风格？

我建议的风格关键词是：

> **可信、清晰、现代、轻专业、低焦虑、流程化、可解释的 AI 服务。**

不要做得太“炫酷 AI”。签证不是娱乐产品，用户上传的是护照、银行流水、在职证明。你文档也把 PII 明确列为核心风险，并提到护照扫描件、银行流水、PIPL、数据保留和删除要求。 所以视觉上不能像 crypto、AI demo、黑色科技网站那样过度炫。

我会建议这样：

### 整体视觉

用 **白底 / 浅灰底 / 蓝色或青蓝色主色 / 少量绿色成功状态 / 少量橙色提醒状态**。蓝色代表可靠、官方、流程感；绿色代表通过、完成、准备好；橙色代表需要补充、注意事项。不要用大面积紫色霓虹、黑底、强渐变。

### 页面感觉

首页可以是轻 SaaS 风格，但不要太像企业后台。用户进入首页时，要立刻明白三件事：

```text
1. 我告诉系统我要办哪个国家/哪种签证
2. 系统帮我查官方要求并生成材料包
3. 人工审核后交付，材料互相一致
```

### AI 的表达方式

AI 不应该被包装成“神奇自动办签证”。更好的表达是：

```text
AI research + document automation + consistency check + human review
```

中文可以说：

```text
官方来源检索 + 材料自动生成 + 一致性校验 + 人工复核
```

这会比“AI 一键办签证”更可信。因为“AI 一键办签证”容易让人担心幻觉、乱填、隐私泄露、出错没人负责。

### 产品页面结构

第一版可以考虑这几个核心页面：

| 页面 | 设计重点 |
|---|---|
| Landing page | 讲清楚价值、流程、价格、信任机制 |
| Start application | 选择目的地、签证类型、出发城市/领区 |
| Intake form | 分步骤填写，保存进度，低压力 |
| Upload documents | 明确每个材料为什么要上传、是否必需 |
| Progress page | 显示 AI/系统/人工审核进度 |
| Document delivery | 文件清单、下载、注意事项、来源链接 |
| Help / FAQ | 隐私、数据删除、拒签责任、人工审核范围 |

## 4. Adobe Spectrum 2 适合吗？

我的判断：**Adobe Spectrum 可以参考，但不建议作为 Visa Master 的首选 design system。**

理由是：

Adobe Spectrum 是 Adobe 的设计系统，React Spectrum 是它的 React 实现。Adobe 官方介绍 React Spectrum 是 Adobe Spectrum design system 的 React 实现；Adobe 的文档和博客也强调 Spectrum 2 是面向 Adobe 大量应用的一套统一体验升级。

它的优点是：精致、专业、克制、组件质量高，适合专业工具类产品。你的产品确实有一点“专业工具”的属性，比如材料包生成、审核、文件管理、状态流转。

但问题是：Adobe Spectrum 的气质更像 **Adobe 专业软件 / 创意生产力工具 / Adobe 生态应用**。Visa Master 是面向普通消费者和准专业自助用户的“服务型工具”。你需要的是“清楚、亲和、可信、低门槛”，而不是太强的 Adobe 产品感。

所以我会这样用它：

| 用法 | 建议 |
|---|---|
| 直接采用 React Spectrum | 不作为首选 |
| 参考它的表单、按钮、对话框、空状态、进度状态 | 可以 |
| 学它的克制、清晰、可访问性 | 很值得 |
| 把网站做成 Adobe 风 | 不建议 |
| 用它做后台审核工具 | 可以考虑，但不是最优先 |

简单说：**Adobe 适合参考“专业感”，不适合作为你整个网站的默认视觉基因。**

## 5. awesome-design-systems 里面，我推荐哪些？

你给的 `awesome-design-systems` 仓库本质上是一个设计系统目录。它自己也定义 design system 是一组原则、最佳实践和文档，通常体现在 UI library、pattern library，也可能包括 voice & tone。它还标注了各系统是否有组件、语气规范、设计师 kit、源码等。

基于 Visa Master，我会按优先级这样推荐：

## 第一推荐：Ant Design

**适合程度：高。**

Ant Design 官方定位就是 enterprise products 的设计系统和 React UI library，强调企业级产品里的确定性、模式复用和一致性。

这很适合你的 **后台、dashboard、申请进度、表单、材料清单、审核台**。你的产品有大量结构化表单、状态、文件列表、材料检查、任务流，这些都是 Ant Design 的强项。

但 Ant Design 的缺点是：默认风格偏后台、偏企业系统。如果首页直接用原生 Ant Design，可能会显得像一个内部管理平台，不够消费级、不够温和。

我的建议是：

> **前台官网不要太 Ant Design；登录后的 application dashboard / admin / reviewer portal 可以重度使用 Ant Design。**

适用部分：

```text
用户 dashboard
申请列表
材料 checklist
上传状态
补材料表单
人工审核后台
管理员后台
路线配置后台
```

## 第二推荐：Material Design 3 / Material UI

**适合程度：中高。**

Material Design 3 是 Google 的开源设计系统，官方定位是用于构建美观、可用产品的设计系统。 它的优势是用户熟悉度高、移动端友好、表单/按钮/卡片/步骤流都很成熟。

对 Visa Master 来说，Material 的好处是：更大众化、更接近普通用户的手机 App 体验。缺点是：如果做得不好，会显得比较“Android / Google 风”，品牌独立性不够。

适合部分：

```text
移动端体验
分步骤 intake form
卡片式选择国家/签证类型
进度条
提醒与错误状态
```

## 第三推荐：USWDS / GOV.UK / 政府类设计系统作为参考

**适合程度：作为参考很高，直接采用中等。**

Visa 本质上是半官方、强规则、高风险事项。所以政府类设计系统很值得研究。USWDS 是美国联邦政府设计系统，强调可访问、移动友好、组件、UX 指导、设计 tokens。 它的 accessibility 文档也强调组件、指导和页面级用户测试的重要性。

你不一定要直接使用 USWDS 的样式，因为它会让网站太像美国政府网站。但你应该学习它的：

```text
表单设计
错误提示
帮助文本
清晰文案
可访问性
材料说明
步骤式服务流程
```

对签证产品来说，这类系统的“朴素可信”比很多炫酷 SaaS 模板更有价值。

## 第四推荐：Shopify Polaris

**适合程度：中等偏高，适合作为服务型后台/商户后台参考。**

Polaris 是 Shopify Admin 的设计系统，官方说它用于 Shopify 管理后台和 app 体验。 Shopify 自己也有一句很好的思路：design system 是地板，不是天花板；它提供 building blocks，但仍要根据用户需求组合。

Polaris 的气质比 Ant Design 更“服务型”和“商业操作型”，不像 Ant 那么强企业管理系统味。它对你的启发主要是：

```text
任务列表
设置页面
商户式后台
用户要完成一个业务任务
卡片 + 表单 + 状态提示
```

缺点是 Polaris 是 Shopify 生态强绑定，直接拿来用不一定自然。

## 第五推荐：IBM Carbon

**适合程度：中等。**

Carbon 是 IBM 的开源设计系统，用于产品和数字体验，也提供 React 组件。 Carbon 的组件定位很清楚：每个组件解决具体 UI 问题，比如列表、提交表单、反馈等。

Carbon 的优点是专业、理性、企业级、信息密度不错。缺点是它的 IBM 风格比较强，可能偏冷、偏大型企业软件。Visa Master 如果做 B2B 签证代理后台，Carbon 可以；如果做 C 端自助签证产品，它可能太严肃。

## 第六推荐：GitHub Primer

**适合程度：中等。**

Primer 是 GitHub 的设计系统，目标是为 GitHub 界面提供 cohesive、inclusive、responsive 的体验，并减少人与软件之间的 friction。

它很适合开发者工具、文档、设置、项目管理类产品。Visa Master 如果偏“文件包生成器 / workflow tool”，可以参考 Primer 的清晰和克制。但对普通旅游签用户来说，Primer 可能有一点技术产品感。

## 第七推荐：Microsoft Fluent 2

**适合程度：中等。**

Fluent 2 有 React 版本和 Web Components 等实现路径。 它适合办公、文档、生产力场景。Visa Master 有“文档处理”和“办公自动化”的一面，所以可以参考。但它的 Microsoft 味道比较明显，不一定适合作为独立消费品牌的主视觉。

## 我的最终建议

我会把 Visa Master 分成三个 UI 层：

### A. 官网 / 营销页

不要直接用 Ant Design 或 Adobe Spectrum 的默认样式。建议用：

```text
Next.js + Tailwind CSS + shadcn/ui / Radix 风格组件
```

视觉风格：现代、干净、轻信任、轻服务、像“签证版 TurboTax / LegalZoom / Wise / Notion Forms”的感觉。

首页要强调：

```text
不是 AI 炫技
不是旅行社黑箱
而是官方来源 + 自动生成 + 一致性校验 + 人工复核
```

### B. 用户申请流程

可以用 **shadcn/ui / Radix / Material-like form patterns**，重点是：

```text
一步一步填
每步少字段
进度明确
错误提示清楚
随时保存
解释为什么要问这个信息
```

这里不要用过高信息密度的企业后台风格。

### C. 登录后 dashboard / 人工审核后台

这里我会推荐 **Ant Design**。

原因很简单：你会大量需要：

```text
Table
Form
Steps
Upload
Modal
Drawer
Descriptions
Alert
Tag
Timeline
Progress
Tabs
Collapse
```

Ant Design 对这些非常成熟，而且你的后台审核、路线配置、材料列表、状态管理，本质上就是企业级 workflow UI。Ant Design 的定位也正好是 enterprise-class design language and React UI library。

## 一句话结论

如果只选一个，我建议：

> **Visa Master 前台品牌风格参考政府服务 + 现代 SaaS；用户流程用轻量、亲和、移动友好的组件；后台和审核台用 Ant Design。Adobe Spectrum 可以参考专业感和交互质量，但不建议作为主 design system。**

更具体一点：

| 场景 | 推荐 |
|---|---|
| 官网首页 | Tailwind + shadcn/ui，自定义品牌 |
| 用户 intake form | shadcn/ui / Radix / Material-like patterns |
| 用户 dashboard | Ant Design 或 shadcn/ui |
| 人工审核后台 | Ant Design |
| 设计参考 | USWDS/GOV.UK 的清晰表单 + Polaris 的服务后台 + Adobe 的专业克制 |
| 不建议 | 全站直接套 Adobe Spectrum |

## Objective Observer Analysis

从更理性的角度看，你现在最容易犯的偏差是“名牌 design system 偏差”：看到 Adobe、Google、Alibaba、IBM，就容易以为越大厂越适合。但 design system 的选择不是品牌崇拜，而是产品任务匹配。

Visa Master 的核心不是“展示技术高级”，而是“让用户相信这个系统不会害我填错、不会乱处理我的隐私、不会编造签证要求、不会让我交一堆不一致的材料”。因此，最优策略不是选一个最酷的 UI，而是建立一个低焦虑、高解释性、高流程可见性的体验。长期看，真正的壁垒也不是按钮长什么样，而是路线覆盖、官方来源更新、材料一致性、人工审核流程、隐私合规和交付质量。

Timestamp: 2026-08-08 20:29:08.845 EDT | Response #4