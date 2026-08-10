The one escape hatch out of the WeChat webview, shared by payment and delivery.

```jsx
const [stuck, setStuck] = React.useState(false);
const pay = () => (isWeChat() ? setStuck(true) : goToCheckout());
<WeChatEscape open={stuck} reason="payment" url={handoffUrl} onDismiss={() => setStuck(false)} />
```

Downloads and Alipay handoffs both fail silently inside WeChat, so one overlay mitigates both. Show it at the two points where it bites — the payment step and pack delivery — and check with `isWeChat()` **before** the action, never after a failure the user has to interpret.

The `url` must carry the auth handoff token: the whole point is that the external browser opens signed in, on the same step, with nothing retyped. State the token's lifetime; it is single-use and must not be forwarded.

It takes the screen. A toast cannot be the mitigation for an action that cannot be completed at all.
