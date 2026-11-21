import React, { useState, useEffect, useRef } from "react";

export const Gallery = (props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);
  const items = props.data || [];
  const L = props.labels || {};
  const count = items.length;

  const goTo = (i) => setActiveIndex((i + count) % count);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActiveIndex((i) => (i + 1) % count), 4000);
  };

  useEffect(() => {
    if (count === 0) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [count]);

  const handleNav = (dir) => {
    goTo(activeIndex + dir);
    resetTimer();
  };

  const getSlotClass = (i) => {
    const prev = (activeIndex - 1 + count) % count;
    const next = (activeIndex + 1) % count;
    if (i === activeIndex) return "gc-slide gc-center";
    if (i === prev) return "gc-slide gc-left";
    if (i === next) return "gc-slide gc-right";
    return "gc-slide gc-hidden";
  };

  return (
    <div id="portfolio" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>{L.title}</h2>
          <p>{L.subtitle}</p>
        </div>
        {count > 0 && (
          <div className="gc-wrapper">
            <div className="gc-stage">
              {items.map((d, i) => (
                <div
                  key={i}
                  className={getSlotClass(i)}
                  onClick={() => { goTo(i); resetTimer(); }}
                >
                  <img src={d.smallImage} alt={d.title || `${L.imageAlt} ${i + 1}`} />
                </div>
              ))}
            </div>

            <button className="gc-btn gc-btn-left" onClick={() => handleNav(-1)} aria-label={props.carousel ? props.carousel.prev : ""}>
              <i className="fa fa-chevron-left"></i>
            </button>
            <button className="gc-btn gc-btn-right" onClick={() => handleNav(1)} aria-label={props.carousel ? props.carousel.next : ""}>
              <i className="fa fa-chevron-right"></i>
            </button>

            <ol className="gc-dots">
              {items.map((_, i) => (
                <li
                  key={i}
                  className={i === activeIndex ? "active" : ""}
                  onClick={() => { goTo(i); resetTimer(); }}
                ></li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
