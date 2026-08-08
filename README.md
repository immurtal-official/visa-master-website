# Visa Master — design & documentation

Design documents, architecture decision records, and the reasoning behind them
for **Visa Master**, a service that turns a visa request into a complete,
ready-to-submit application pack.

There is no application code here. The agent, its toolchain, and the Docker
packaging live in the separate `visa-master` repo.

## Start with `PRODUCT.md`

[`PRODUCT.md`](PRODUCT.md) is the standing context for the whole project: what is
being built, for whom, how the pipeline works today, which constraints are
already settled, and what is genuinely still open. It exists so the project does
not have to be re-explained from scratch every time — read it before working
here, whether you are a person or an assistant.

Two sections of it carry weight beyond description:

- **§7 Non-negotiable constraints** — the agent is untrusted, every pack passes a
  human review gate, PII handling is a requirement, cost discipline, customers in
  mainland China. These are decided; don't re-open them without a reason.
- **§10 What is still open** — where new thinking actually belongs.

## Layout

| Path | Contents |
|---|---|
| `PRODUCT.md` | The project primer — read first |
| `doc/` | Architecture versions v0.1 → v0.4 (v0.4 is current) and the platform & development plan |
| `discussion/` | Architecture decision records and the discussions behind them, filed by which assistant they were held with |

Suggested entry point into the architecture: [`doc/architecture-v0.4-en.md`](doc/architecture-v0.4-en.md),
Part I only — about ten minutes, and it ends with a table of every decision
pointing at its detail section.

## Conventions

- Documents are **English-primary**, with `-zh` Chinese translations kept 1:1 in
  structure — same headings, tables, and code blocks, with SQL and JSON
  byte-identical apart from translated comments. If you change an English
  document that has a `-zh` twin, update the twin too, or say plainly that you
  did not.
- Architecture versions are **additive**. v0.4 supersedes the *framing* of the
  earlier versions but does not delete them; v0.3 remains authoritative for the
  agent security model.
- ADRs are **amended by new ADRs**, never edited in place. ADR-003 amending
  ADR-002 is the worked example.

## The `.html` files are generated — do not hand-edit them

`doc/architecture-v0.4-en.html` and `doc/platform-and-dev-plan-en.html` are built
from the matching `.md` files, with their mermaid diagrams pre-rendered to inline
SVG so the pages need no network access.

Their build pipeline is **not in this repo yet** and cannot be reproduced from a
clean checkout. Until it is committed, treat the generated HTML as read-only:
change the `.md` source and note that the HTML needs regenerating, rather than
patching the output. Editing the HTML directly appears to work and is silently
discarded by the next rebuild — this has already happened once.
