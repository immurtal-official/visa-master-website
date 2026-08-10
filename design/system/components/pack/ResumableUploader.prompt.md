Chunked uploader that survives an in-app-browser tab switch.

```jsx
<ResumableUploader files={files} onPick={pick} onRetry={retry} />
```

Desktop takes multi-file drag-and-drop; touch opens the picker. A stalled upload is amber and offers 继续上传, never an error.