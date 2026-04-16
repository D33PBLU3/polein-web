Applies when editing src/data/data.json or any src/components/*.jsx that renders text.

DO:
- Put all user-visible strings (labels, body copy, section titles) in `data.json`, not in JSX
- Keep social link keys as-is (`youtube` = WhatsApp URL, `twitter` = Instagram URL) — changing key names requires matching updates in `contact.jsx`
- Use `props.data ? props.data.field : "loading"` guard pattern when a component depends on async-loaded JSON (set via `useEffect` in `App.jsx`)

AVOID:
- Hardcoding Spanish display text in JSX — components are intentionally data-driven so content can be updated without touching component code
- Adding new top-level keys to `data.json` without wiring them in `App.jsx`'s `landingPageData` state and passing them as props to the component
