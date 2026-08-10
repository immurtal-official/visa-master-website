Sits at the top of a failed page, takes focus on render, links to each field.

```jsx
<ErrorSummary errors={[{ field: "passport-no", message: "护照号码需要 9 位，请检查后重新填写" }]} />
```

Every message says what to do next. Always pair with the inline message on the field itself.