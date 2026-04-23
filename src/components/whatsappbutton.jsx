import React from "react";

export const WhatsAppButton = ({ link, phone }) => {
  return (
    <div className="float-btns">
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="float-btn float-btn-call"
          aria-label="Llamar a Polein"
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
          aria-label="Contáctanos por WhatsApp"
        >
          <i className="fa fa-whatsapp"></i>
        </a>
      )}
    </div>
  );
};
