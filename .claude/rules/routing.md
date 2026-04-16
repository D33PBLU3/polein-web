Applies when editing src/components/navigation.jsx or any component that uses React Router hooks.

DO:
- Check `location.pathname === '/'` before generating anchor hrefs — on the root page use `#section`, on any other route use `/#section`
- Use `<Link>` from react-router-dom for internal page navigation (e.g., the privacy policy link in the footer)
- Wrap new route-level pages in `<Route>` inside the existing `<Routes>` in `App.jsx`

AVOID:
- Using bare `<a href="/some-path">` for internal routes — gh-pages serves from a subdirectory in dev but the homepage is set, so React Router handles all routing
- Adding `<Navigation />` to sub-routes (e.g., TermsAndConditions) without also handling the anchor-link logic — the nav is currently only rendered on `/`
