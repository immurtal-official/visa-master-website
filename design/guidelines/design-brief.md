# Design Brief (paste-ready)

**Purpose:** the one-page distillation of [`design-system-selection-en.md`](design-system-selection-en.md)
and [`mobile-parity-en.md`](mobile-parity-en.md) to hand to a design tool or a
human designer who will not read two thousand lines. It is tool input, not a
document — it deliberately has no `-zh` twin.
**Keep in sync with:** the two documents above. If they change, this changes.

---

## Blurb (short field)

> Visa Master — a visa application-pack service for Chinese applicants. Web app
> only (Next.js), UI language Simplified Chinese. A user answers a long
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
> **Typography:** all UI copy is Simplified Chinese. Render CJK in the system
> stack (PingFang SC first, then HarmonyOS Sans / MiSans / Noto Sans CJK).
> **Never load a Chinese webfont** — customers are on mainland networks and it
> would cost megabytes. Design and review the type scale in PingFang SC. A small
> subsetted Latin face is the only webfont allowed.
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
> a pack file-tree preview; a consistency-check report (dates/city/employer
> conflicts across documents); a source-and-caveat citation panel; a
> document-upload checklist with per-item rationale and status; a multi-page
> camera-capture loop with thumbnail reorder; a resumable uploader.
>
> **Real copy to design against** — homepage hero:
> title「更清楚地准备你的签证材料包」, primary CTA「开始准备材料」, secondary
> 「查看支持路线」, trust row「官方来源核对 · 材料自动生成 · 一致性校验 ·
> 人工复核后交付」. Pack preview card sections: 从这里开始 / 官方文件 /
> 可编辑模板 / 本人材料 / 来源与提醒.
>
> **What I want first:** the token set (colour, type scale in PingFang SC,
> spacing, radius, elevation) and the base components; then three screens —
> the homepage hero at 375px and at 1280px, one intake step showing the
> one-question-per-page pattern with its progress affordance, and the pack
> delivery page with the file tree and per-file preview.
