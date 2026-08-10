The intake hub: every section, its state, and a way in. GOV.UK task-list shaped.

```jsx
<TaskList sections={[
  { id: "you", title: "基本信息", items: [
    { id: "id", title: "身份与证件", state: "done" },
    { id: "job", title: "在职与收入", state: "progress", hint: "大约 4 分钟" },
    { id: "pay", title: "付款", state: "locked", after: "上传材料" },
  ]},
]} onSelect={(item) => go(item.id)} />
```

This is the page a returning applicant lands on, and the page every step returns to. It is what makes 25 screens read as nine sections rather than a queue with no end — so it is the hub for the whole intake, not a summary shown once at the start.

Always render every section, including ones not started. A locked item states what unlocks it (`after`); greying it out without saying why reads as a bug. Jumping in is allowed anywhere that is not locked — order is a recommendation, not a gate.
