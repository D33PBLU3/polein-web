import React from "react";

// Brand names as text only — logos would need each brand owner's permission.
export const Brands = (props) => {
  const d = props.data;
  if (!d) return null;
  return (
    <div id="brands" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>{d.title}</h2>
          <p>{d.subtitle}</p>
        </div>
        <ul className="brand-list">
          {d.items.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="brand-disclaimer">{d.disclaimer}</p>
      </div>
    </div>
  );
};
