import React from "react";

export const WhatsAppButton = ({ link, phone, labels }) => {
  const L = labels || {};
  return (
    <div className="float-btns">
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="float-btn float-btn-call"
          aria-label={L.call}
        >
          <i className="fa fa-phone"></i>
        </a>
      )}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="float-btn float-btn-whatsapp"
          aria-label={L.whatsapp}
        >
          <i className="fa fa-whatsapp"></i>
        </a>
      )}
    </div>
  );
};
