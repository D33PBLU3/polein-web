import React, { useState, useEffect, useRef } from "react";

export const Testimonials = (props) => {
  const items = props.data || [];
  const count = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  const goTo = (i) => setActiveIndex((i + count) % count);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActiveIndex((i) => (i + 1) % count), 5000);
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
    if (i === activeIndex) return "tc-slide tc-center";
    if (i === prev) return "tc-slide tc-left";
    if (i === next) return "tc-slide tc-right";
    return "tc-slide tc-hidden";
  };

  return (
    <div id="testimonials">
      <div className="container">
        <div className="section-title text-center">
          <h2>TESTIMONIOS</h2>
        </div>
        {count > 0 && (
          <div className="tc-wrapper">
            <div className="tc-stage">
              {items.map((d, i) => (
                <div
                  key={i}
                  className={getSlotClass(i)}
                  onClick={() => { goTo(i); resetTimer(); }}
                >
                  <i className="fa fa-quote-left"></i>
                  <p>"{d.text}"</p>
                  <div className="tc-meta">— {d.name}</div>
                </div>
              ))}
            </div>

            <button className="tc-btn tc-btn-left" onClick={() => handleNav(-1)} aria-label="Anterior">
              <i className="fa fa-chevron-left"></i>
            </button>
            <button className="tc-btn tc-btn-right" onClick={() => handleNav(1)} aria-label="Siguiente">
              <i className="fa fa-chevron-right"></i>
            </button>

            <ol className="tc-dots">
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
