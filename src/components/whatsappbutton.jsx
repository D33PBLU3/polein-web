import React from "react";

export const WhatsAppButton = ({ link }) => {
  if (!link) return null;
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contáctanos por WhatsApp"
    >
      <i className="fa fa-whatsapp"></i>
    </a>
  );
};
