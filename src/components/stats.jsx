import React from "react";

export const Stats = (props) => {
  return (
    <div id="stats">
      <div className="container">
        <div className="stats-row">
          {props.data
            ? props.data.map((d, i) => (
                <div key={i} className="stat-item">
                  <span className="stat-number">{d.value}</span>
                  <span className="stat-label">{d.label}</span>
                </div>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};
