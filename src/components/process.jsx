import React from "react";

export const Process = (props) => {
  const d = props.data;
  if (!d) return null;
  return (
    <div id="process" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>{d.title}</h2>
          <p>{d.subtitle}</p>
        </div>
        <ol className="process-steps">
          {d.steps.map((s, i) => (
            <li key={s.title} className="process-step">
              <span className="process-num">{i + 1}</span>
              <i className={s.icon}></i>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        {props.whatsapp && (
          <a
            href={props.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-custom btn-lg process-cta"
          >
            <i className="fa fa-whatsapp"></i> {d.cta}
          </a>
        )}
      </div>
    </div>
  );
};
