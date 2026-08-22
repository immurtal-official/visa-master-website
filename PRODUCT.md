# Visa Master — what this project is

**Read this first.** It is the standing context for the whole project: what we are
building, for whom, how it works today, and what is already decided. Everything
else in this repo (`doc/`, `discussion/`) elaborates on it.

**Stage:** pre-launch, solo founder. The agent pipeline works end to end and has
produced a real, QA-checked pack; the product around it is being built.

---

## 1. The product in one paragraph

Visa Master turns "I live in Chengdu and want a tourist visa for Spain" into a
complete, ready-to-submit visa application pack — researched from current
official sources, assembled into consistent documents, machine-checked, and
reviewed by a human before delivery. The customer answers a structured intake
form; some minutes later they get an organised folder of official forms,
filled-in templates, a day-by-day itinerary, and a checklist that all agree with
each other.

## 2. Why anyone pays for it

Visa preparation is high-stakes, fiddly, and badly served:

- **Requirements are scattered and jurisdiction-specific.** They differ by
  destination, visa type, *and* by which consulate covers the applicant's city.
  A Chengdu resident and a Shanghai resident applying to the same country face
  different centres, forms, fees, and hours.
- **Consistency is what gets checked.** Rejections often come from mismatches —
  employer name, dates, city order, or salary that disagree between the
  application form, the employment letter, the itinerary, and the hotel bookings.
  Assembling all of it from one structured intake is exactly what a machine
  should do and a human does badly.
- **The information goes stale.** Fees, addresses, and required forms change.
  Research has to happen at request time against official sources, not from a
  blog post someone wrote in 2023.
- **The alternative is an agency** charging far more for the same clerical work,
  or hours of the applicant's own error-prone effort.

## 3. What a pack actually contains

From a real validated run (Chengdu → Spain, Schengen tourism, 20 days):

```
00_Start_Here/          Read-first master checklist · submission index
01_Official_Documents/  3 genuine official PDFs downloaded from source
                        (consulate tourism checklist, Schengen application
                        form, required acknowledgment questionnaire)
02_Editable_Templates/  5 DOCX: application-form field guide, employment &
                        leave certificate, 20-day itinerary, cover letter,
                        optional financial explanation
03_Your_Documents_To_Add/ The applicant's own evidence, organized: passport &
                        photos, hukou, employment & company papers, bank
                        statements, insurance, transport & hotel bookings
04_Sources_and_Warnings/ Every source cited, with current caveats
```

Machine QA renders every artifact and reported **0 issues** with terminal status
`visual-review-required` — meaning it is clean, and a human still looks before it
ships. That human gate is deliberate and permanent (see §7).

## 4. Who the customer is

Chinese citizens applying for foreign visas; the validated beachhead is
**Schengen tourist visas, Chengdu consular district, Spain**. The profile that
drove development:

> Chengdu resident, IT architect, employed since 2020, gross ¥6,000/month,
> ~¥100,000 in savings, travelling alone, 20 days in Spain, passport valid to 2028.

Beachhead first, then adjacent routes (other Schengen destinations, other Chinese
consular districts), because the research and form-mapping work is per-route and
compounds — each solved route becomes a cached asset.

## 5. How it works today (validated, not aspirational)

- An **agent** does the work: real web browsing of embassy / BLS / EU sources,
  downloading official PDFs, running Python and LibreOffice to render DOCX/PDF,
  then a deterministic document builder and QA runner.
- It runs on **Hermes** (NousResearch agent runtime) with a custom profile — a
  persona plus four skills: `visa-intake`, `research-core`, `form-mapping`,
  `document-production` — and a Node CLI that owns the managed runtime.
- **~10 minutes per pack**, dominated by sequential LLM reasoning steps.
- It runs **containerised** (`visa-master-hermes`, ~5 GB, arm64), which is how the
  autonomous agent is kept away from the host machine.
- Development used a personal ChatGPT-subscription login for the model.
  **Production must use real provider API keys** — that migration is a known,
  scheduled prerequisite, not an option.

## 6. Where the product is going

The architecture is specified in [`doc/architecture-v0.4-en.md`](doc/architecture-v0.4-en.md)
(two tiers: read Part I for the shape). The shape in brief:

- A **trusted backend owns the workflow** — a deterministic state machine in
  plain code and Postgres. It owns users, money, data, and the verdict on whether
  work is finished. No LLM decides business rules.
- **Agent work happens in pluggable executors** behind one adapter contract: an
  LLM API gateway (the workhorse, and the only place provider keys live), a
  Hermes server (today's pack producer), and a thin custom agent (the migration
  target). Swapping which one runs a task is a routing-table edit.
- Planned hosting: **Vercel + Supabase** for the control plane, **one Hetzner VM**
  for the agent plane — see [`doc/platform-and-dev-plan-v2-en.md`](doc/platform-and-dev-plan-v2-en.md)
  for the comparison, the eight-week build plan, and the cost model.

## 7. Non-negotiable constraints

These are settled and should not be re-litigated without a reason:

1. **The agent is untrusted.** It browses the live web and executes code on a
   customer's passport and bank statements. It runs in an ephemeral,
   single-tenant container that is destroyed after each job, reaches the network
   only through an audited egress proxy, and never touches the database or
   business secrets. This drove the entire v0.1→v0.3 design arc.
2. **A human reviews every pack before delivery.** Visa errors are expensive for
   the customer. Nothing auto-delivers.
3. **PII is the core risk.** Passport scans and bank statements, for PRC users,
   under PIPL. Retention schedules, purge-on-request, and minimising what reaches
   the agent are requirements, not polish.
4. **Cost discipline.** Solo founder. Infrastructure is planned at ~$75/month
   fixed; LLM usage is the entire variable cost line.
5. **Customers are in mainland China.** Reachability of auth domains and payment
   rails is a real design input.

## 8. Business model

- **Per-pack pricing**, planned at roughly **¥199–399 (~$28–55)**.
- **Cost per pack is $0.60–4.00**, essentially all LLM spend — so gross margin is
  above 85% even at conservative token estimates.
- First payments via a Stripe Payment Link with Alipay enabled; self-serve billing
  is deliberately deferred until there are enough paying users to justify it.
- Target: a paying beta in eight weeks with hand-picked users on the beachhead
  route, with the founder personally performing the review gate.

## 9. Where things live

| Repo | Contents |
|---|---|
| `visa-master` | The agent profile, the Node CLI and toolchain, the Docker packaging. This is the thing that produces packs. |
| `visa-master-website` (this repo) | Everything else: the design documents, the decision records, and the application code built against them — the web app, the conductor, and the agent-plane compose. |

Inside this repo: `doc/` holds the architecture versions (v0.1→v0.4) and the
platform plan, in English with `-zh` Chinese translations of the v0.4 set;
`discussion/` holds the architecture decision records and the reasoning behind
them; `design/` holds the product design work and the exported design system;
and `apps/`, `packages/` and `infra/` hold the product itself.
[`STATUS.md`](STATUS.md) says which parts of it are built.

## 10. What is still open

- **Route coverage beyond Chengdu → Spain** — each new route needs research and,
  where a form is fillable, an approved field map.
- **Whether Hermes stays.** ADR-002 chose a custom workflow engine; ADR-003
  records that Hermes ships in V1 anyway as a pluggable executor, to be replaced
  by a thin custom agent once that reaches quality parity. The trigger for
  starting that migration is written down; it has not fired.
- **Latency.** ~10 minutes is acceptable with visible progress, but model routing,
  parallel steps, and caching are the identified levers if it becomes a problem.
- **How much a human must still do per pack** — this determines whether the
  business scales past the founder's own review capacity.
