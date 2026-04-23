import React, { useState } from "react";

export const Faq = (props) => {
  const [openIndex, setOpenIndex] = useState(0);
  const items = props.data ? props.data.items : [];

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div id="faq" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>{props.data ? props.data.title : "loading"}</h2>
          <p>{props.data ? props.data.subtitle : "loading"}</p>
        </div>
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            {items.map((d, i) => (
              <div
                key={i}
                className={`faq-item${openIndex === i ? " faq-open" : ""}`}
                onClick={() => toggle(i)}
              >
                <div className="faq-question">
                  <span>{d.question}</span>
                  <i className={`fa ${openIndex === i ? "fa-minus" : "fa-plus"}`}></i>
                </div>
                {openIndex === i && (
                  <div className="faq-answer">
                    <p>{d.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
