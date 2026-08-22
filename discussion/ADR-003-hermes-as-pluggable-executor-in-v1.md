# ADR-003: Hermes as a Pluggable Executor in V1

**Status:** Accepted **Amends:** [ADR-002](ADR-002-Agent-Framework-Evaluation.md) **Date:** 2026-08-03

> 中文版:[ADR-003(中文)](ADR-003-hermes-as-pluggable-executor-in-v1-zh.md)

## Context

ADR-002 (Accepted) decided: build a custom Workflow Engine, use LLM APIs as stateless
intelligence services, and *"General-purpose Agent Runtimes remain future options but are
not adopted in Version 1."*

Since then, [architecture v0.4](../doc/architecture-v0.4-en.md) introduced a uniform
**agent adapter contract** with three executor kinds behind the workflow engine — LLM API
gateway, Hermes server, thin custom agent — and the practical situation is that the
Hermes-based pipeline is the **only component that produces a sellable visa pack today**
(validated end-to-end in Docker: research → retrieval → document build → QA).

## Decision

ADR-002's core decision stands unchanged: **the custom workflow engine is the control
plane**, owns all business rules, routing, budgets, and completion judgment, and LLM APIs
via the gateway remain the V1 workhorse for every single-shot step.

One consequence is amended: **Hermes IS adopted in V1 — not as the core runtime, but as a
pluggable executor** behind the adapter contract, restricted to `produce_pack`, wrapped in
the v0.3 container discipline (ephemeral single-tenant container, egress proxy, artifact-
based completion, human review gate). It is scheduled to be strangled out task-type by
task-type per architecture v0.4 Chapter C §4.1, with `produce_pack` migrating last.

## Consequences

- A reader of ADR-002 alone would conclude no agent runtime ships in V1; this ADR corrects
  that: one does, behind a contract that keeps it replaceable by a routing-table edit.
- ADR-002's V5 milestone ("evaluate Hermes or another Agent Runtime when autonomous
  execution becomes a product requirement") inverts into a *decommissioning* evaluation:
  Hermes leaves when the thin agent reaches QA parity on `produce_pack` (≥ 50 cases).
- All ADR-002 latency/cost mitigations (deterministic checks, parallel steps, caching,
  small prompts) apply unchanged — they live in the workflow engine and gateway, not in
  the executor choice.
