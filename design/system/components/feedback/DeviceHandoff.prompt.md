Continue on another device, and phone-as-camera for a desktop session.

```jsx
<DeviceHandoff mode="continue" url={link} code="4KP9-2K" qrSrc={qr} minutes={15} state="waiting" />
<DeviceHandoff mode="camera" url={link} code="4KP9-2K" qrSrc={qr} state="connected" device="iPhone 13" />
```

Offer `mode="continue"` at **every** long step, not only when something breaks. Switching devices is a normal choice — filling in the form on the train, uploading at home — and treating it as a workaround makes people restart instead.

`mode="camera"` is the desktop path for uploads: scanning a passport with a laptop webcam produces something no consulate will accept, so the phone shoots and the shots appear in the open desktop session.

The QR is rendered by the app via `qrSrc` because the code carries a signed one-time token. Always pass `code` too: QR scanning fails often enough on older Android that the typed code has to be an equal path, not a fallback.
