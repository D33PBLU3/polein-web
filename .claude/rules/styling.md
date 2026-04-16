Applies when editing public/css/style.css, public/css/bootstrap.css, or src/App.css.

DO:
- Add component-specific overrides to `public/css/style.css` — it is the authoritative custom stylesheet and is loaded last
- Use `src/App.css` only for responsive breakpoints below 400px that apply globally
- Reference the established color palette: orange `#ff8200`, dark navy `#00263a`, link blue `#608dfd`, body text `#777`
- Use Bootstrap 3 grid classes (col-md-*, col-xs-*) — the Bootstrap version in `public/css/bootstrap.css` is v3, not v4/v5

AVOID:
- Modifying `public/css/bootstrap.css` directly — it is a local copy of Bootstrap 3 and changes will be overwritten conceptually; add overrides in `style.css` instead
- Using CSS variables or CSS modules — the project uses plain CSS with no preprocessor
- Adding Tailwind or utility-class frameworks — Bootstrap 3 and custom CSS cover all current needs
