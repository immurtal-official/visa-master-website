The asynchronous pack pipeline: 官方来源核对 → 材料生成 → 一致性检查 → 人工复核.

```jsx
<PipelineProgress current={2} etaMinutes={40} notes={{ consistency: "正在比对护照、在职证明和银行流水上的姓名与日期" }} />
<PipelineProgress current={3} states={{ review: "blocked" }} notes={{ review: "复核员需要一份更清晰的银行流水" }} />
```

Not StepProgress. StepProgress is intake — one screen at a time, section / step / total, the user drives it. This is machine work measured in minutes to hours that the user waits on, may close, and comes back to. Different shape, different component; do not substitute one for the other.

The four stages are fixed and always all rendered, including the ones not started: a user returning an hour later has to find the same four rows in the same places. Keep the "you can close this page" line — closing the tab is the behaviour to support, not to discourage. A stage that needs the user becomes `blocked`, with a note saying what to do.
