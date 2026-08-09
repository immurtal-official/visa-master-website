# Design Brief (paste-ready)

**Purpose:** the one-page distillation of [`design-system-selection-en.md`](design-system-selection-en.md)
and [`mobile-parity-en.md`](mobile-parity-en.md) to hand to a design tool or a
human designer who will not read two thousand lines. It is tool input, not a
document — it deliberately has no `-zh` twin.
**Keep in sync with:** the two documents above. If they change, this changes.

---

## Blurb (short field)

> Visa Master — a visa application-pack service for Chinese applicants. Web app
> only (Next.js). **The whole product ships in Simplified Chinese and English**
> — every screen, not just the marketing pages — architected so further
> languages are a translation job rather than a rebuild. A user answers a long
> structured intake, uploads passport / bank statement / employment documents,
> pays, and receives a consistency-checked, human-reviewed pack of documents
> they print and submit to a consulate. Two surfaces carry the product: a
> marketing site that must establish trust in ten seconds, and a long,
> resumable, one-question-per-page intake form. Mobile web and desktop web are
> equally first-class.

## Notes (long field)

> **Stack is already decided — please work inside it.** Next.js + Tailwind +
> Radix primitives via shadcn/ui, components owned in our repo. Do **not** hand
> back Material, Ant Design, Chakra, or any vendor design system's look. We want
> our own tokens and our own components.
>
> **Feeling:** trustworthy, clear, modern, lightly professional, low-anxiety,
> procedural, explainable. This is a high-trust service — people upload
> passports and bank statements. Explicitly avoid: neon-on-black, AI-purple
> gradients, travel-agency photo carousels, government-website austerity, and
> enterprise-dashboard density.
>
> **Colour:** blue / teal / deep navy primary; white and light blue-grey
> backgrounds; green for success; amber for warning; red for error but
> deliberately de-escalated — a missing document is not a catastrophe.
>
> **Typography — two scripts, one scale.** Render CJK in the system stack
> (PingFang SC first, then HarmonyOS Sans / MiSans / Noto Sans CJK) and Latin
> in a small subsetted webfont. **Never load a Chinese webfont** — customers are
> on mainland networks and it would cost megabytes. Design and review the scale
> in **both** scripts, with line height set per script (CJK ~1.7–1.8, Latin
> ~1.5) — they do not share an optical size at the same nominal size.
>
> **Bilingual, and expansion-proof.** Every screen exists in Chinese and
> English, so every component must survive **+100% text expansion** over the
> Chinese string: no fixed widths on anything containing text, no truncated
> action labels, the 2×2 trust-point grid tolerating two-line cells, and no
> sentence assembled from fragments. Use CSS logical properties
> (`margin-inline-start`, `text-align: start`) rather than left/right so a
> future right-to-left language is a stylesheet change. Include a **language
> switcher** in the header and footer (inside the collapsed nav on mobile — it
> must not take a top-level mobile nav slot); each language names itself in its
> own language (简体中文 / English), never a flag. The switcher carries a
> permanent one-line note: it changes the interface language only — the
> language of the delivered document pack is set by the destination country's
> requirements, and each file in the pack is labelled with its own language
> regardless of UI language.
>
> **Interaction model** — borrowed from the GOV.UK Design System, which is the
> best reference for high-stakes forms filled in by anxious people doing this
> once: one thing per page; ask the question as a sentence with the explanation
> inline beneath it (never a tooltip — hover does not exist on touch); an error
> summary at the top linking to each field plus inline messages that say what to
> do; visible progress and save-and-resume; plain language everywhere.
>
> **Both devices are first-class; build narrow-first and widen.** Mobile
> constraints that shape components: dialogs become bottom sheets, not centred
> modals; native `<select>` on touch, not a custom listbox; 44×44pt touch
> targets; 16px minimum input font; `dvh` and safe-area insets; one sticky
> bottom action bar that survives the keyboard. Desktop is not the mobile stack
> centred with whitespace — it gets multi-file drag-and-drop, side-by-side
> comparison, the whole pack tree in one view, and full keyboard traversal of
> the intake. Much of the traffic arrives inside the WeChat and Xiaohongshu
> in-app browsers.
>
> **The components no library ships — these are the interesting ones:**
> a pack file-tree preview (each file labelled with its own language); a
> consistency-check report (dates/city/employer conflicts across documents); a
> source-and-caveat citation panel; a document-upload checklist with per-item
> rationale and status; a multi-page camera-capture loop with thumbnail
> reorder; a resumable uploader; the language switcher described above.
>
> **Real copy to design against** — homepage hero:
> title「更清楚地准备你的签证材料包」, primary CTA「开始准备材料」, secondary
> 「查看支持路线」, trust row「官方来源核对 · 材料自动生成 · 一致性校验 ·
> 人工复核后交付」. Pack preview card sections: 从这里开始 / 官方文件 /
> 可编辑模板 / 本人材料 / 来源与提醒.
>
> **What I want first:** the token set (colour, the type scale in both PingFang
> SC and the Latin face, spacing, radius, elevation) and the base components;
> then three screens — the homepage hero at 375px and at 1280px, one intake
> step showing the one-question-per-page pattern with its progress affordance,
> and the pack delivery page with the file tree and per-file preview. **Show
> the hero and the intake step in both Chinese and English**, so the layout is
> proven against the longer strings rather than only the Chinese ones.
