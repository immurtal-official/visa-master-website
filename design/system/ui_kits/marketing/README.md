# Marketing site — UI kit

One screen, two widths. `index.html` renders the homepage and carries a 1280 / 375 toggle in the bottom-right; 375 renders inside a phone frame.

- `Home.jsx` — header, hero with the pack-preview card, three-step explainer, consistency-check section, sources-and-caveats section, navy CTA, footer.

Copy is verbatim from the brief where supplied: 「更清楚地准备你的签证材料包」, 「开始准备材料」, 「查看支持路线」, 「官方来源核对 · 材料自动生成 · 一致性校验 · 人工复核后交付」, and the five pack sections.

Everything is composed from the system's own components — `SiteHeader`, `Button`, `Card`, `Badge`, `TrustRow`, `PackFileTree`, `ConsistencyReport`, `CitationPanel`, `Callout`, `SiteFooter`. The kit adds no new primitives.
