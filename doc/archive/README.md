# Archive

Superseded documents, kept rather than deleted. Nothing here is wrong about the
day it was written; each was replaced by something later, and the replacement is
named below. Read these to understand how a decision was arrived at — never to
find out what is true now.

What is *not* here: `doc/architecture-v0.3-en.md` stays in `doc/` because it is
still authoritative for the agent security model. v0.4 supersedes its framing
and not its §5.2 egress rules, which `infra/squid/squid.conf` implements and the
conductor's tests assert. Version number is not the axis; whether a document is
still in force is.

| Document | Replaced by | Note |
|---|---|---|
| `architecture-v0.1-en.md` (+ two images) | v0.2, then v0.4 | The first shape of the system |
| `Design_Readme.md` | v0.1 itself, then v0.4 | A v0.1-era proposal under an older name |
| `architecture-v0.2-en.md` | v0.4 | Named FastAPI for the backend; v0.4 superseded that with Node/TypeScript |
| `architecture-v0.3-slides.html` (+ five images) | — | A presentation of v0.3. The v0.3 *text* is still current and lives in `doc/` |
| `platform-and-dev-plan-en.md` | [`platform-and-dev-plan-v2-en.md`](../platform-and-dev-plan-v2-en.md) | Superseded by ADR-004, which made the control plane API-first |
| `platform-and-dev-plan-en.html` | — | The generated reader for the above, and behind it by two revisions |
| `platform-and-dev-plan-zh.md` | — | The 1:1 Chinese mirror of the v1 plan. No v2 mirror has been generated yet |
| `EXECUTION-PLAN-week1-2.md` | [`STATUS.md`](../../STATUS.md) for state; the v2 plan for what is next | The commit-by-commit plan weeks 1–2 executed. Still the primary source for *why* the root configuration looks the way it does (§3), the first three migrations (§7), and the two i18n gates (§5.3–5.4) |

Architecture versions are additive here: a new version supersedes the framing of
the old one and does not delete it. Moving a document into this folder is the
same statement, made in the file tree.
