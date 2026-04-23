import React from "react";

export const Clients = (props) => {
  return (
    <div id="clients" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>NUESTROS CLIENTES</h2>
          <p>{props.data ? props.data.subtitle : "loading"}</p>
        </div>
        <div className="row">
          {props.data
            ? props.data.types.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-xs-12 col-sm-6 col-md-3">
                  <div className="client-item">
                    <i className={d.icon}></i>
                    <h3>{d.name}</h3>
                    <p>{d.text}</p>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};
