# Discussion 01 — Do we need Hermes, or can a custom agent loop do this?

> **Context:** This discussion starts **after** [`doc/architecture-v0.3-en.md`](../../doc/architecture-v0.3-en.md).
> It steps back from *how to deploy the agent safely* (v0.1–v0.3) to a more
> foundational build-vs-adopt question about the agent runtime itself.
>
> **Status:** Open discussion / decision memo · 2026-08-03

---

## The question

> What is actually *unique* about Hermes? If I write my own loop — with the
> right conditions — that calls the ChatGPT / Gemini / Claude API, and decides
> for itself *when to fetch a web page* and *when to ask the user another
> question*, can't that do the same job? Then I'd own the coordination, drop
> Hermes, and get close to 100% control. Isn't a simple loop enough?

---

## Short answer (thesis)

1. **You're right that the orchestration loop is simple, and you can write it.**
   The loop is *not* what Hermes is worth.
2. **Hermes's value is the large pile of tools, skills, a managed
   document-production runtime, and production/ops scaffolding *around* the
   loop** — most of which Visa Master doesn't use, but a few pieces of which are
   genuinely non-trivial.
3. **For your stated priority — control + security over a PII-heavy flow — a
   thin custom agent with a small set of whitelisted tools is a legitimately
   strong option.** Smaller attack surface, full transparency. But be honest
   about what you'd re-own.
4. The realistic choice is a **middle path**, not "raw DIY" vs. "full Hermes."

---

## 1. A "custom loop" really is simple — you're correct about that

The core agentic pattern is small:

```
context = [system_prompt, user_task]
while not done:
    reply = LLM(context, tools=TOOLS)      # native tool-calling: OpenAI / Anthropic / Gemini all have it
    if reply.tool_calls:
        for call in reply.tool_calls:
            result = dispatch(call)         # fetch_page(), run_code(), ask_user(), ...
            context.append(result)
    else:
        done = True                         # model produced a final answer
```

- **"Decide when to fetch a web page"** = the model emits a `fetch_page` tool
  call; your loop runs it. Nothing to design.
- **"Decide when to ask the user a follow-up"** = an `ask_user` tool that pauses
  the loop for input. (Hermes's `clarify` tool is literally this.)
- The "coordination" you're picturing **is** this loop. It's ~150 lines.

So: the thing you thought might be hard is the easy part. Good instinct.

## 2. What Hermes actually bundles (the part that isn't the loop)

Grounded in what we saw this session running the real product:

- **A large, hardened tool/skill library** — 28 toolsets · 67 skills. Real
  browser automation (headless Chromium: navigate, click, snapshot — not just
  HTTP GET), a code-execution sandbox, file tools, PDF tooling (poppler),
  LibreOffice rendering, vision/image tools, web search, MCP integration.
- **A managed document-production runtime** — a profile-local Python venv
  (python-docx, pypdf, reportlab, lxml…), a **deterministic document builder**
  and a **QA runner** that renders every artifact to PDF + contact sheets and
  reports issues. (This is the part Visa Master leans on most.)
- **A skill/profile system** — SOUL + skills as composable, model-agnostic
  instructions with *progressive disclosure* (load a skill's references only
  when its phase begins, to bound context).
- **An execution & ops substrate** — container packaging, s6 supervision,
  session/workbench state, checkpoints, cron, a gateway/API server,
  multi-provider abstraction (we swapped Codex ↔ config), credential/auth
  management, and safety scaffolding (approvals, `--yolo`, tool gating, an
  egress command, a security scanner).
- **The unglamorous robustness tail** — retries, context compaction, tool-result
  truncation, error recovery, streaming, session resume, token budgeting. This
  is what turns a demo loop into a production agent, and it's the part people
  most underestimate.

## 3. The 5% / 95% framing

The loop is ~5% of the work. Tools + skills + the managed runtime + robustness +
ops are the other 95%. The common failure mode: build the 5% in a weekend, demo
it, then spend months re-building the 95% — worse. The honest question is not
"can I write the loop" (yes) but **"how much of that 95% do I actually need, and
do I want to own it?"**

## 4. But how much of that 95% does Visa Master use?

Not much of the *breadth*. Visa Master needs web research, PDF download/parse,
DOCX/PDF generation, QA, and intake Q&A. It does **not** need Spotify, Discord,
smart-home, pets, achievements, or ~60 other skills. So today you carry (in
complexity, opacity, and attack surface) a general-purpose platform for a
fairly narrow need. That asymmetry is the real case *against* Hermes.

## 5. The control & security angle (this cuts toward custom)

This is the same concern that drove the whole v0.1–v0.3 containerization: an
autonomous agent browsing the web and running code on a user's passport data is
a large, hard-to-reason-about surface — especially under `--yolo` across 28
toolsets.

A **thin custom agent with ~6 whitelisted tools** is dramatically easier to
secure and audit: you know every tool that exists, every URL shape it can hit,
every file it can touch. For a PII-heavy visa product, *"the agent can only do
these six things"* is a stronger, simpler security story than *"the agent is a
general platform, now let's fence it in."*

Caveat on "100% control": you control the **loop, the tools, and the prompts** —
not the **model**. Inference is still a third-party API (OpenAI / Anthropic /
Google), and hallucination and prompt-injection susceptibility come from the
model, not from Hermes. Rolling your own loop does not change that (see §10).

## 6. The switching cost people miss

Leaving Hermes is **not** just "rewrite the loop." Visa Master's actual value —
the SOUL persona, the four skills (`visa-intake`, `research-core`,
`form-mapping`, `document-production`), the toolchain, the curated route guides
(e.g. Spain-Schengen-Chengdu), and the approved PDF form maps — is **authored in
Hermes's format**. Migrating means re-expressing all of that domain logic in
your own framework. That is the real lock-in, and it's exactly why v0.3 §9
called "runtime independence" over-claimed. The corollary: the earlier you are,
the cheaper it is to choose a thinner stack now and avoid the re-expression tax
later.

## 7. It's a spectrum, not a binary

| Option | You write | You get for free | Control | Effort |
|---|---|---|---|---|
| **Raw API + your loop** | loop, every tool, all robustness | nothing | maximal | high |
| **Thin agent SDK + a few tools** | a few purpose-built tools | loop + tool plumbing + some robustness | high | medium |
| **Hermes** | a profile + skills | everything (most unused) | low–medium | low to start, opaque later |

"Thin agent SDK" = e.g. the Anthropic or OpenAI agent SDKs, LangGraph, or
Pydantic-AI. They give you the exact loop you described, plus retries / streaming
/ tool plumbing, while **you** define the small tool set. That is the option your
question is really pointing at.

## 8. Recommended middle path

Don't pick raw-DIY *or* full-Hermes. Instead:

- Build a **thin custom agent on a minimal agent SDK** (keeps the loop simple and
  robust without you re-owning retries/streaming/context handling).
- Give it a **small set of purpose-built, whitelisted tools** you fully control:
  browse/fetch, PDF extract, DOCX/PDF render, QA, `ask_user`. This is the "100%
  control over what the agent can do" you want.
- **Keep Hermes only where it clearly saves real time** — most plausibly the
  managed **document-production + QA runtime**, which is non-trivial to rebuild.
  You can even shell out to Visa Master's existing toolchain for that one piece
  while owning the loop and everything else.

## 9. A concrete decision test

List the tools a *real* Visa Master run actually invokes. From this session:

1. web search / browse (Google, Bing, Baidu, embassy/BLS sites)
2. navigate + click + snapshot (real browser)
3. download a PDF
4. `pdftotext` / `pdfinfo` extraction
5. code execution (Python transforms)
6. document build → DOCX/PDF render (python-docx, reportlab, LibreOffice)
7. QA render + checks
8. `ask_user` / clarify (intake)

That's ~8 tools. **If you can build or assemble those eight as tools you trust,
a thin custom agent wins on control and security.** If rebuilding (6)+(7) is more
than you want to take on, keep that piece and own the rest.

## 10. What you do *not* get from either choice

- The model is still a third-party API — hallucination, refusal, and
  prompt-injection susceptibility are model properties, not framework properties.
- Therefore the v0.3 controls (egress governance, ephemeral single-tenant
  isolation, human review gate) still apply **regardless** of Hermes vs. custom.
  Owning the loop reduces surface; it does not remove the need for the boundary.

---

## 11. Deep-dive: "Hermes feels slow — would custom be faster?"

Observation this session: a full pack run took **~10 min** wall-clock. Before
concluding "Hermes is slow, custom would be fast," decompose where the time
actually goes. Three buckets:

### (A) Hermes-specific overhead — a custom build removes this

- **Boot**: container start + s6 supervision tree + a per-boot skill-sync ran
  ~15–20s *before the task even started*. A custom process boots in ~1s.
- **Prompt weight**: 28 toolsets + 67 skills + a long SOUL means a large system
  prompt on *every* LLM turn → each turn is slower (and pricier). A lean agent
  with ~8 tools and a tight prompt carries far less per-turn context. **This is
  the underrated one** — it compounds across dozens of turns.

Real, but the boot piece is small in absolute terms; the prompt-size piece is
the meaningful part.

### (B) Inherent to the task — a custom build pays it too

- **LLM reasoning round-trips dominate.** The run made dozens of *sequential*
  tool calls, each one an inference on a big reasoning model (seconds each).
  ~40 turns × ~5–15s ≈ several minutes. A custom loop calling the same model for
  the same number of steps is *equally* slow here.
- **Real web latency**: loading embassy / BLS pages, headless-Chromium renders,
  downloads — network-bound seconds each.
- **Document rendering**: LibreOffice (`soffice`) cold-start is slow, and QA
  renders every artifact to PDF + contact sheets. Same cost in custom unless you
  change the renderer.

### (C) The real levers — available in *either*, but custom lets you pull them freely

1. **Model routing.** Use a small/fast model for easy subtasks (field
   extraction, classification), reserve the big model for planning. Hermes tends
   to run one big model for everything. Biggest single latency lever.
2. **Fewer, bigger steps.** Collapse "navigate → click → snapshot → back →
   snapshot" chains into fewer calls. Every turn removed is a round-trip saved.
3. **Parallelism.** Fetch N sources at once; render N docs concurrently. Hermes's
   linear skill flow mostly doesn't; a custom orchestrator can.
4. **Caching.** Route guides, form maps, rendered template shells — reuse them.
5. **Smaller context** (see A).
6. **Staged output.** Return a fast first-pass draft (~2 min, like the v1 draft
   we saw) and refine in the background, instead of one monolithic
   produce-at-the-end.

### Honest conclusion

A custom build *can* be faster — but mostly because it lets **you** tune
model-routing, context size, parallelism, and staging for your task, **not**
because "Hermes is slow." Those are speedups you **earn by engineering**, not get
for free by dropping Hermes. And several of them (faster model, dropping unused
skills) are tunable *inside* Hermes today.

### Measure before you rebuild

"Feels slow" is not a plan. Instrument one real run — time per LLM call, per
tool, per render. A likely split is **~60–70% LLM reasoning · ~15–20%
document/render · ~10% web · ~5% Hermes boot**. If that holds, the win comes from
model-routing + parallelism + fewer steps (prototypable *without* leaving
Hermes), and the "rebuild for speed" case rests mainly on per-turn context
savings and the freedom to parallelize.

### Perceived speed (the product answer)

For a web product, *perceived* latency often matters more than wall-clock. v0.3's
async + streaming already lets you show live progress ("researching embassy
requirements… building itinerary… running QA…") and deliver a quick draft first.
A streamed 10-min job can feel better than a silent 4-min one. You may not need
it *faster* so much as *legible*.

---

## Where this leaves us (open questions)

- What is the honest engineering cost of items (6)+(7) — the document builder +
  QA runner — if we own them? That single answer probably decides the whole thing.
- Do we want the domain logic (route guides, form maps, skills) to live in
  Hermes's format long-term, or in a format we control?
- Time-to-market vs. control: how much runway are we spending to gain how much
  ownership?

- **On speed:** what is the actual per-bucket time split of a real run? Rebuild-
  for-speed only makes sense once we know how much is Hermes overhead vs.
  inherent LLM/render latency.

*Next: (1) instrument one real Hermes run for a per-bucket time split (LLM /
render / web / boot); (2) scope a one-week spike of a thin custom agent (minimal
SDK + the ~8 tools) to measure the real cost, especially the document/QA piece —
against that baseline.*
