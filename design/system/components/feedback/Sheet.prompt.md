One overlay, two presentations: bottom sheet under 768px, centred dialog above.

```jsx
<Sheet open={open} title="换一个申请国家？" description="已填写的答案会保留。" actions={<Button>确认更换</Button>} onClose={close} />
```

Never force `mode="dialog"` on a phone.