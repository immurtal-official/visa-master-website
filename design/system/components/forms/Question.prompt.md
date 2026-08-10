The intake page shell: one question, its explanation, its error, its control.

```jsx
<Question question="你这次去申根国家主要做什么？" hint="选择最接近的一项。后面会根据它决定需要哪些材料。">
  <RadioGroup name="purpose" options={opts} value={v} onChange={setV} />
</Question>
```

The question is a sentence, rendered as the page h1. Never move the hint into a tooltip.