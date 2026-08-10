The delivered pack as a tree, in the fixed section order.

```jsx
<PackFileTree
  tree={[{ id: "official", name: "官方文件", children: [
    { id: "f1", name: "Erklärung zum Zweck der Reise", kind: "pdf", language: "de", status: "ready" },
    { id: "f2", name: "在职证明（中英对照）", kind: "doc", language: { code: "zh-CN", name: "中文 / English" }, status: "waiting" },
  ]}]}
  selectedId={id} onSelect={sel} />
```

Sections are always 从这里开始 / 官方文件 / 可编辑模板 / 本人材料 / 来源与提醒. On desktop it sits in a left column beside FilePreview; on mobile it is the whole page and selecting pushes the preview.

**Every file row shows its own language.** `language` is a BCP-47 tag rendered as the language's self-name (`de` → Deutsch) — the same in the Chinese and English interface, because the destination country sets it, not the reader. Never leave it off a file that has one, never encode it in `status`, and never let a filename be the only place it appears: the applicant must not be able to read the interface language as the pack language. `{ code, name }` covers bilingual documents.

`status` also takes `{ label, tone }` for states this design system does not enumerate (公证中, 已寄出).
