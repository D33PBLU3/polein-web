import { describeSource } from "./analytics";

const src = (url, referrer = "") => describeSource(new URL(url), referrer);

it("detects Google Ads clicks, with the campaign when tagged", () => {
  expect(src("https://polein.com.mx/?gclid=abc")).toBe("Google Ads");
  expect(src("https://polein.com.mx/?gbraid=x&utm_campaign=gdl")).toBe(
    "Google Ads (campaña: gdl)"
  );
});

it("detects Facebook/Instagram link clicks and UTM tags", () => {
  expect(src("https://polein.com.mx/?fbclid=1")).toBe(
    "Facebook / Instagram (enlace)"
  );
  expect(src("https://polein.com.mx/?utm_source=instagram&utm_medium=bio")).toBe(
    "instagram / bio"
  );
});

it("falls back to the referrer", () => {
  expect(src("https://polein.com.mx/", "https://www.google.com.mx/")).toBe(
    "Búsqueda en Google"
  );
  expect(src("https://polein.com.mx/", "https://l.facebook.com/")).toBe("Facebook");
  expect(src("https://polein.com.mx/", "https://www.instagram.com/")).toBe("Instagram");
  expect(src("https://polein.com.mx/", "https://example.org/x")).toBe(
    "Sitio externo (example.org)"
  );
});

it("returns empty for direct visits and internal navigation", () => {
  expect(src("https://polein.com.mx/")).toBe("");
  expect(src("https://polein.com.mx/", "https://www.polein.com.mx/aviso")).toBe("");
});
