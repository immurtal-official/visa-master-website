Text and multi-line fields at 16px minimum so iOS never zooms on focus.

```jsx
<Input label="护照号码" hint="请与护照资料页完全一致，包括字母大小写。" width="md" />
<Textarea label="补充说明" rows={5} />
```

Width communicates expected length: xs/sm for numbers and dates, md for names, full for addresses.