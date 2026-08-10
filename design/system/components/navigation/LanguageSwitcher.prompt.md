Interface-language switcher — each language names itself; carries a permanent note that it does not change the delivered pack's language.

```jsx
<LanguageSwitcher value={lang} onChange={setLang} placement="header" />
```

Placements: `header` (inline row, desktop header and footer bar), `nav` (stacked with 44px targets — this is how it appears on mobile, inside the collapsed nav, so it never takes a top-level mobile nav slot), `footer` (stacked, inverse tone on the navy footer).

Rules: never a flag or a country name; never fewer than the full set of shipped languages; never drop the note. The note text defaults per `value` — pass `note` only to localise it further.

Placement policy: desktop shows it in the header AND the footer; mobile shows it inside the collapsed nav AND the footer.
