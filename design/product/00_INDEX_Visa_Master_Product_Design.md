---
project: Visa Master
version: draft-v0.2
language: zh-CN
created_at: 2026-08-08
---

# Visa Master 产品设计 Markdown 包索引

本包把当前阶段最重要的产品设计材料拆成 5 个文件，方便后续放进 repo、Notion、Google Docs 或产品需求文档中继续迭代。

## 文件列表

| 文件 | 内容 | 用途 |
|---|---|---|
| `01_User_Personas.md` | 用户画像、使用动机、付费理由、核心顾虑 | 帮助判断产品定位、文案、功能优先级 |
| `02_Journey_TaskFlow_StateMachine_ServiceBlueprint.md` | 用户旅程、核心任务流、状态机（映射到既定架构词汇）、服务蓝图 | 避免概念重复，并把用户体验与系统实现连接起来 |
| `03_Information_Architecture.md` | 网站/应用页面结构、前台、用户工作台、审核界面、帮助中心 | 指导网站导航、页面规划、路由设计 |
| `04_MVP_Scope_V1_V2.md` | V1 成都→西班牙申根旅游签；V2 相邻路线扩张；美国 B1/B2 为 V3/后续探索 | 明确先做什么、不做什么、何时扩展 |
| `05_Content_Strategy_Homepage.md` | 内容策略、信任表达、AI 表达方式、首页首屏文案 | 指导官网文案、产品说明和品牌语气 |

设计系统选型已单独成文，见 [`../guidelines/design-system-selection-zh.md`](../guidelines/design-system-selection-zh.md)（英文原件：[`design-system-selection-en.md`](../guidelines/design-system-selection-en.md)）。

## 当前核心判断

Visa Master 不是一个单纯的“AI 工具网站”，而是一个高信任、强流程、强材料一致性、涉及个人敏感信息的签证材料自动化服务。

因此，产品设计的第一优先级不是炫技，而是：

1. 让用户相信信息来自官方来源。
2. 让用户相信材料之间会被一致性校验。
3. 让用户知道 AI 不是最终黑箱，人工复核仍然存在。
4. 让用户清楚知道自己每一步要做什么。
5. 让用户知道护照、银行流水、在职证明等敏感信息如何被处理。

一条统辖全包的长期指令（2026-08-09）：**移动端网页支持 100% 的产品功能，体验与桌面端同级。** 客户在手机上的小红书和微信里发现产品，并在手机上完成整个旅程——intake、拍照上传、支付、进度、补材料、材料包交付。任何与此冲突的旧表述以 [`../guidelines/mobile-parity-zh.md`](../guidelines/mobile-parity-zh.md) 为准。

推荐的网站风格：

> 可信、清晰、现代、轻专业、低焦虑、流程化、可解释的 AI 服务。
