# Intake & pack app — UI kit

`index.html` is a click-through of the three app surfaces, with a 1280 / 375 toggle. Screens advance in order: intake → uploads → delivered pack.

- `IntakeStep.jsx` — the one-question-per-page pattern. Three real questions (radio, date, text). Progress sits under the header; back link above the question; the sticky bar owns the primary action. The passport question demonstrates the error state: enter fewer than 9 characters and continue to see the error summary plus the inline message.
- `UploadStep.jsx` — the upload checklist with per-item rationale, the resumable uploader with a stalled file, and the multi-page camera loop with reorderable thumbnails.
- `PackDelivery.jsx` — the five-section pack tree beside a per-file preview on desktop; on mobile the tree becomes a bottom sheet. Tabs switch the right pane between the file, the consistency report and the sources panel.

Mobile is not the desktop layout narrowed: the section dots drop out of the progress, the tree becomes a sheet, buttons go full-width, and the sticky bar gains its autosave note.
