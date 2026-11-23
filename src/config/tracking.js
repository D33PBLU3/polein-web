// Tracking IDs. Leave a value empty ("") to keep that platform disabled —
// its script is never loaded until an ID is filled in.
export const TRACKING = {
  // Google Analytics 4 → Admin › Data streams › Measurement ID (e.g. "G-ABC123XYZ")
  GA4_ID: "G-JH86EDB7JY",

  // Google Ads → Goals › Conversions. ID looks like "AW-123456789".
  GOOGLE_ADS_ID: "AW-18120282115",
  // One conversion action per lead type; paste each action's label
  // (the part after the slash in "AW-123456789/AbC-dEfGhIj").
  GOOGLE_ADS_LABELS: {
    whatsapp_click: "uHt2COr2jL4dEIOgtsBD",
    call_click: "sUpvCO32jL4dEIOgtsBD",
    generate_lead: "UFbmCPD2jL4dEIOgtsBD",
  },

  // Meta (Facebook/Instagram) → Events Manager › Pixel ID (e.g. "123456789012345")
  META_PIXEL_ID: "",
};
