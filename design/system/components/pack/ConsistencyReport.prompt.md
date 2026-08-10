Cross-document conflicts: the same fact read from two sources, with the fix as an instruction.

```jsx
<ConsistencyReport items={items} summary="共检查 42 项，2 项需要你确认。" onResolve={fix} />
```

Severity conflict / check / pass. Never write a conflict as a failure — write it as the next action.