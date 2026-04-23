import React from "react";

export const Tracking = (props) => {
  return (
    <div id="tracking" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>{props.data ? props.data.title : "loading"}</h2>
          <p>{props.data ? props.data.subtitle : "loading"}</p>
        </div>
        <div className="row tracking-steps">
          {props.data
            ? props.data.steps.map((d, i) => (
                <div key={i} className="col-xs-12 col-sm-4 tracking-step">
                  <div className="tracking-step-icon">
                    <span className="tracking-step-number">{i + 1}</span>
                    <i className={d.icon}></i>
                  </div>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};
