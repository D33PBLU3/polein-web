import { TRACKING } from "../config/tracking";

// Meta Pixel standard event for each of our lead events.
const META_EVENTS = {
  whatsapp_click: "Contact",
  call_click: "Contact",
  generate_lead: "Lead",
};

let initialized = false;

const loadScript = (src) => {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
};

const initGtag = () => {
  const firstId = TRACKING.GA4_ID || TRACKING.GOOGLE_ADS_ID;
  if (!firstId) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  if (TRACKING.GA4_ID) window.gtag("config", TRACKING.GA4_ID);
  if (TRACKING.GOOGLE_ADS_ID) window.gtag("config", TRACKING.GOOGLE_ADS_ID);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${firstId}`);
};

const initMetaPixel = () => {
  if (!TRACKING.META_PIXEL_ID || window.fbq) return;
  const fbq = function () {
    fbq.callMethod
      ? fbq.callMethod.apply(fbq, arguments)
      : fbq.queue.push(arguments);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = window._fbq = fbq;
  loadScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", TRACKING.META_PIXEL_ID);
  fbq("track", "PageView");
};

// Sends one lead event to every enabled platform.
// name: "whatsapp_click" | "call_click" | "generate_lead"
export const trackEvent = (name, params = {}) => {
  if (window.gtag) {
    if (TRACKING.GA4_ID) window.gtag("event", name, params);
    const label = TRACKING.GOOGLE_ADS_LABELS[name];
    if (TRACKING.GOOGLE_ADS_ID && label) {
      window.gtag("event", "conversion", {
        send_to: `${TRACKING.GOOGLE_ADS_ID}/${label}`,
      });
    }
  }
  if (window.fbq && META_EVENTS[name]) {
    window.fbq("track", META_EVENTS[name], params);
  }
};

// Where on the page the click happened: nearest section id, or "floating"
// for the fixed call/WhatsApp buttons.
const clickLocation = (el) => {
  if (el.closest(".float-btns")) return "floating";
  const section = el.closest("[id]");
  return section ? section.id : "unknown";
};

// One document-level listener catches every WhatsApp and phone link,
// including ones added later, so components don't need tracking code.
const onDocumentClick = (e) => {
  const link = e.target.closest && e.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)/.test(href)) {
    trackEvent("whatsapp_click", { location: clickLocation(link) });
  } else if (href.startsWith("tel:")) {
    trackEvent("call_click", { location: clickLocation(link) });
  }
};

export const initTracking = () => {
  if (initialized) return;
  initialized = true;
  initGtag();
  initMetaPixel();
  document.addEventListener("click", onDocumentClick, true);
};
