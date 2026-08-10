Full-width tappable option rows; radio for one answer, checkbox for several.

```jsx
<RadioGroup name="purpose" value={v} onChange={setV} options={[
  { value: "tour", title: "旅游", hint: "包括探访朋友但不住在对方家里" },
]} />
```

Each option can carry its own inline explanation. Keep `columns={1}` on mobile.