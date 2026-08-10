# V1 journey prototype

**What it is:** a click-through prototype of the whole V1 journey — 20 screens,
route check through pack delivery — produced in Claude Design against the Visa
Master Design System. Every screen renders at 375px and 1280px and switches live
between 简体中文 and English.

**What it is for:** answering *"why is this screen shaped like this?"* when the
real front end gets built. It is the visual and interaction specification for
`apps/web`. It is **not** production code and nothing in it is imported — see
the ground rule in [`../../README.md`](../../README.md).

## Screens

```
路线      01 路线查询 · 02 暂不支持→等待名单 · 03 创建申请 · 04 代他人·授权同意
填写资料  01 任务清单(hub) · 02 护照·校验错误 · 03 出行日期 · 04 签证历史·我不确定
          05 换设备继续
上传材料  01 材料清单 · 02 断点续传·恢复 · 03 提交前检查
支付      01 确认与支付 · 02 微信内·逃生舱 · 03 支付确认中
处理与复核 01 生成进度 · 02 已驳回·结构化原因 · 03 补材料与重新提交
交付      01 材料包交付
```

## What is deliberately fake

Read the prototype for intent, not for values. All of the following exist only
so the thing runs:

- **All data and state.** Applications, uploads, payment status, QA findings,
  and the pack contents are hard-coded. Nothing persists, nothing is fetched.
- **All validation.** The passport error on 填写资料 02 is staged to demonstrate
  the error-summary pattern. Production validation comes from the shared zod
  schemas in `packages/core` and from nowhere else.
- **The QR code** on 换设备继续 is a placeholder `qrSrc`; the real one carries a
  signed one-time token that only the server may mint. The typed code shown
  beside it (`H4K 92T`) is a fixed string, and it is deliberately presented as
  an equal path rather than a fallback.
- **Prototype-only copy** is registered under `proto.*` in the design system
  catalogue. Structured screen copy — question option sets, the upload
  checklist, the pack tree, consistency readings — lives in per-kit `copy.jsx`
  objects rather than the catalogue, because the prototype catalogue holds flat
  strings only. In production this is a non-issue: option labels come from the
  schema and resolve through ICU message keys like any other string.
- **The employment gate, route support, and pricing** reflect the V1 decisions
  in [`../../product/04_MVP_Scope_V1_V2.md`](../../product/04_MVP_Scope_V1_V2.md)
  at the time of capture. The scope doc governs, not this file.

## What it says nothing about

The backend. State names, job lifecycle, retention, and the review gate come
from [`../../../doc/architecture-v0.4-en.md`](../../../doc/architecture-v0.4-en.md)
and the platform plan. The prototype fakes all of it and must never be read as
a source for it.

## Rebuilding against it

Read a screen, understand the intent, then write the real thing in `apps/web`
against the real schemas. In particular: the intake's field rules, error
messages, and option sets all originate in `packages/core`, with the schema
emitting message keys rather than sentences
([`../../guidelines/internationalization-en.md`](../../guidelines/internationalization-en.md) §3).
A second copy of "what is a valid passport number" living in a component is the
bug this whole arrangement exists to prevent.
