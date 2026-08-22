# ADR-003：V1 中把 Hermes 作为可插拔执行器

**状态：** 已接受 **修订：** [ADR-002](ADR-002-Agent-Framework-Evaluation.md) **日期：** 2026-08-03

> 英文原件：[ADR-003 (English)](ADR-003-hermes-as-pluggable-executor-in-v1.md)

## 背景

ADR-002（状态：已接受）的决定是：自建 Workflow Engine，把 LLM API 当作无状态的智能服务使用，并且明确写道
*"通用 Agent Runtime 仍是未来选项，但在 Version 1 中不予采用。"*

在那之后，[架构 v0.4](../doc/architecture-v0.4-zh.md) 引入了统一的 **Agent 适配器契约**，在工作流引擎之下
挂了三种执行器 —— LLM API 网关、Hermes 服务器、轻量自研 Agent。而现实情况是：基于 Hermes 的流水线
是**今天唯一能产出可售卖签证包的组件**（已在 Docker 中端到端验证：研究 → 检索 → 文档构建 → QA）。

## 决策

ADR-002 的核心决定保持不变：**自研工作流引擎就是控制面**，由它掌握全部业务规则、路由、预算和
完成判定；通过网关调用的 LLM API 仍是 V1 中所有单次调用步骤的主力。

其中一条推论被修订：**Hermes 在 V1 中确实被采用 —— 但不是作为核心 runtime，而是作为适配器契约之下
的一个可插拔执行器**，仅限于 `produce_pack`，并被包裹在 v0.3 的容器纪律里（即抛单租户容器、出站代理、
按产物判定完成、人工复核门）。按架构 v0.4 第 C 章 §4.1，它将被逐个 task_type 绞杀出局，`produce_pack`
最后迁移。

## 后果

- 只读 ADR-002 的人会以为 V1 不上任何 agent runtime；本 ADR 更正这一点：确实上了一个，但它挂在契约
  之下，改一行路由表就能替换掉。
- ADR-002 的 V5 里程碑（"当自主执行成为产品需求时再评估 Hermes 或其它 Agent Runtime"）反转成一次
  *下线*评估：当轻量自研 Agent 在 `produce_pack` 上达到 QA 对等（≥ 50 个案件）时，Hermes 退场。
- ADR-002 提出的全部延迟/成本缓解手段（确定性检查、并行步骤、缓存、小提示词）原样适用 —— 它们活在
  工作流引擎和网关里，与执行器的选择无关。
