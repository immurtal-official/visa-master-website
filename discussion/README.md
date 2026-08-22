# Decisions, and the arguments behind them

Two kinds of document, and the difference matters when you are looking for
something.

**The ADRs, in this folder, are a ledger.** Every one of them is in force. They
are amended by later ADRs and never edited in place, so ADR-002 is not obsolete
because ADR-003 amends it — you cannot read the amendment without the thing it
amends. Read them in order.

| Record | Decision | Status |
|---|---|---|
| [ADR-002](ADR-002-Agent-Framework-Evaluation.md) | A custom workflow engine over an agent framework | Amended by ADR-003 |
| [ADR-003](ADR-003-hermes-as-pluggable-executor-in-v1.md) ([zh](ADR-003-hermes-as-pluggable-executor-in-v1-zh.md)) | Hermes ships in V1 anyway, as a pluggable executor behind one adapter contract, to be replaced once a thin custom agent reaches quality parity | In force; the migration trigger is written down and has not fired |
| [ADR-004](ADR-004-api-first-control-plane.md) | The control plane is API-first: the web UI is one client of `/api/v1`, with no private channel | In force; implemented, and compressed into [`AGENTS.md`](../AGENTS.md) |

There is no standalone ADR-001: the series begins at 002, because the earliest
decisions were recorded inside the architecture documents instead. Do not
confuse it with the ADR-001/002/003 in [architecture v0.2 §11](../doc/archive/architecture-v0.2-en.md) —
those are one-line records in an older, unrelated numbering scheme, and v0.2 is
archived.

**`explorations/` holds the arguments**, not the conclusions: the comparisons
and long-form reasoning that a decision came out of. They are not binding, they
are not maintained, and where one disagrees with an ADR, the ADR wins.

| Exploration | Led to |
|---|---|
| [`Hermes_vs_Custom_Workflow_Engine_v2.md`](explorations/Hermes_vs_Custom_Workflow_Engine_v2.md) (held with ChatGPT) | ADR-002 |
| [`01-hermes-vs-custom-agent-loop.md`](explorations/01-hermes-vs-custom-agent-loop.md) (held with Claude) | ADR-003 |
| [`design-system-options-zh.md`](explorations/design-system-options-zh.md) (held with ChatGPT) | [`design/guidelines/design-system-selection-en.md`](../design/guidelines/design-system-selection-en.md), which keeps most of its recommendation and reverses one part |

These used to be filed by which assistant they were held with. That is recorded
above where it is still interesting, and is no longer the folder structure: a
reader looking for a decision does not know, or care, which model was in the
room.
