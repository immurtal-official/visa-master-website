# ADR-005：后端独立成服务 —— `apps/api` 里的 FastAPI

**状态：** 已接受，2026-10-05
**修订：** [ADR-004](ADR-004-api-first-control-plane.md) 的第 7–9 条，以及「抽离接缝」那一条后果；ADR-004 其余内容不变
**不修订：** [架构 v0.4](../doc/architecture-v0.4-zh.md)（后台作业这一侧、conductor、两侧之间以数据库为接口）

> 英文原件：[ADR-005 (English)](ADR-005-fastapi-backend-service.md)

## 决定

处理请求的后端从 Next.js 应用里搬出来，成为一个独立服务：用 **Python（FastAPI）** 写，放在
**`apps/api`**，单独部署。仓库仍是一个 monorepo，里面是分别部署的几个应用：

```
apps/web/        网页前端（Next.js）—— 页面、组件、它自己的登录 cookie
apps/app/        手机 App（占位）
apps/api/        后端（FastAPI，Python 3.12）—— 所有 /api/v1/** 接口
apps/conductor/  后台作业的工作流引擎（不变）
packages/core/   规则 —— 唯一的来源，每个应用都读它
packages/db/     数据库迁移、权限、pgTAP（不变）
```

`/api/v1` 契约不变：路径、请求体、响应、错误格式都一样 —— 规则失败是
`422 {issues:[{path,key,params?}]}`，其余是 `{error:{key,…}}`。没有任何客户端需要为这次搬迁
改写；现有的无界面契约测试（`apps/web/e2e/api-contract.spec.ts`）就是每个接口搬过去之后的验收标准。

## 背景

ADR-004 在 8 月分析过这次拆分并决定推迟：第二个客户端逼出来的是契约，不是第二个服务；契约已经在
Next.js 里建好，服务层留作以后抽离的接缝。它记录的触发条件 —— 请求路径上需要只有 Python 才有的库、
有 Python 协作者加入、某个执行器离开虚拟机 —— 都还没有出现。

这次仍然决定拆分，理由不在 ADR-004 的触发条件之列，按实记录如下：

- **归属清晰。** 后端在 `apps/web` 里时，前后端代码都是 TypeScript、在同一棵目录树里，靠文件级的标记
  （`"use client"`、`server-only`）区分，而不是靠放在哪里。创始人希望边界在目录结构上一眼可见：前端
  一个应用，后端一个应用，只通过 HTTP 通信。
- **同一套做法。** 创始人的另一个产品（[nihao-pet/platform](https://github.com/nihao-pet/platform)）
  已经是这个形态并已上线 —— Next.js 和 Expo 客户端、单独部署的 FastAPI 服务、Bearer token、提交进仓库
  的 OpenAPI 契约。两个产品用同一种方式运行，本身就有价值。
- **请求处理这一层可以独立部署、独立扩容**；以后有 Python 生态更擅长的请求路径工作（文档处理、数据
  处理）时，也有现成的地方放。

这次拆分**不**带来的东西，也写清楚，免得日后被当成理由：它不是这个产品负载所在。重活 —— 几分钟的
材料包生成、模型调用、容器 —— 都在后台作业那一侧，本来就是分开的。请求处理这一层只是读写表单。

## 代价，以及每一项怎么付

**1. 规则跨越了语言边界。** 这个产品要保持一致的每一条规则都以 TypeScript 写在 `packages/core` 里：
问卷和它的校验、作业契约和校验和、材料清单和它的条件、读出的值哪些能填进问卷。网页读它做即时提示，
conductor 读它做写回，后端读它做每一个算数的判断。Python 后端没法直接引用。两份会走偏的副本，正是
这个产品要防止的那种问题。

付法是：**`packages/core` 仍是唯一写规则的地方**。

- 规则里**属于数据的部分** —— 节、题、作答方式、选项、分支条件、每道题用哪条有名字的规则、材料清单、
  路线检查的表、文案键清单、契约版本和校验和 —— **从 `packages/core` 导出成 JSON**，提交进仓库，由
  Python 服务读取。合伙人改问卷仍然只改 `questionnaire.ts`；`pnpm check:intake` 会重新生成导出文件。
- 规则里**属于逻辑的部分** —— `rules.ts` 里那十来条有名字的规则（护照号、过去的日期、护照有效期覆盖
  行程），以及求值逻辑（条件、哪些题被问到、读出的值能填哪些）—— 在 Python 里再实现一次，放在
  `apps/api/app/rules/`。它很少改，而且只由工程师改；合伙人不能新增有名字的规则。
- **一致性测试数据**保证第二份实现确实一样：`packages/core` 用 TypeScript 在固定时间点生成数千条
  「输入 → 结果」（就是第 3 阶段核对 2,970 条结果的那个办法），存成 JSON 提交。Python 测试必须逐条复现。
  一边改了规则、另一边没改，CI 会在第一条不一致的数据上失败；有名字的规则在 Python 里没有实现，会报出
  这条规则的名字。

**2. 登录方式换了传输。** 现在登录状态是 Supabase 的 cookie，由同一个进程读取。API 服务**只接受
Bearer token** —— Supabase 签发的 access token，用项目的 JWKS 验签 —— 和 Nihao 的 ADR-0003 一样：
手机 App 没有可以共享的 cookie，两种凭证就是两处可能出错的地方。网页把 cookie 登录状态留作**客户端**
自己的事：它的服务器把每个 `/api/v1` 请求转发给 API，并从这个登录状态里取出 access token 放进
`Authorization: Bearer` 头（一个不含业务逻辑的薄转发层）；登录时，把 API 返回的 token 存进同样的 cookie。
手机 App 自己保管 token，直接调用 API。

**3. 权限防线必须保住。** 现在每个与用户相关的查询都以用户本人的身份执行，所以行级安全和按列权限 ——
第二道防线，2026-10-05 已在 staging 上核实 —— 在服务自己的检查之下仍然生效。API 保留这一点：它直接
连 Postgres（asyncpg），每个与用户相关的请求都在一个事务里先执行 `set local role authenticated`，并用
验签后的 token 设置 `request.jwt.claims` —— 也就是 PostgREST 的做法。服务写错的查询，数据库照样会拒绝。
以产品自身权限行事的操作（排作业、标记 `stored`）明确使用 service 角色，和现在用管理员客户端一样。

**4. 两套部署。** `apps/api` 是一个独立的 Vercel 项目（Python 运行时，和 Nihao 的 `nihao-api` 一样），
有自己的域名；`apps/web` 指向它。本地 `pnpm dev` 同时启动两者。

## 怎么迁移

逐个接口替换（strangler），每一步都可以单独回退：

1. `apps/api` 骨架：配置、JWKS 验签、以用户身份执行的数据库会话、按现有格式返回错误、
   `/api/v1/health`、OpenAPI 导出。
2. 规则导出、Python 版规则、一致性测试数据。
3. 网页加上转发层。搬一个接口的步骤是：在 `apps/api` 里实现它，用契约测试证明它，删掉 Next.js 里对应的
   路由处理器 —— 之后这个路径就由转发层送到 API。`apps/web/src/lib/services/` 逐步清空，最后删除。
4. `AGENTS.md`、`CODEBASE.md`、`STATUS.md` 跟着代码更新。

## 不变的部分

- ADR-004 的第 1–6 条和第 10 条：所有能力都在 `/api/v1/**` 之后，没有 Server Actions，页面通过 API 取数据，
  传输里只有文案键，所有客户端共用一份契约。
- 第 7–9 条换了位置：路由处理器是薄的 HTTP 适配层，**在 `apps/api/app/routers/`**；业务逻辑**在
  `apps/api/app/services/`**；数据库访问只在 API 里。
- conductor、作业契约、出网边界、两侧之间以数据库为接口。
- 文件本身仍不经过 API：上传先通过 API 登记，再以本人 token 直传存储，最后通过 API 确认。
- 数据库迁移留在 `packages/db`（Supabase CLI），不放进 `apps/api`。

## 回退

在删掉最后一个 Next.js 路由处理器之前，任何一个接口都可以通过恢复它的处理器回到 Next.js。删掉之后，
服务层仍在 git 历史里，契约测试也仍然准确描述了它的行为，所以回退是一次移植，不是重新设计。
