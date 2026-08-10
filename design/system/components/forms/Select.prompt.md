Always the native select — on touch this opens the OS picker.

```jsx
<Select label="申请国家" options={["法国","德国","意大利"]} placeholder="请选择" width="md" />
```

Never replace with a custom listbox. For more than ~20 options use a searchable page instead.