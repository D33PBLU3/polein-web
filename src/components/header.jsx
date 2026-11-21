import React from "react";

// The banner image already contains the visible headline, so the <h1> is
// screen-reader/SEO only (sr-only) and mirrors the image text plus location.
export const Header = (props) => {
  const data = props.data || {};
  const whatsapp = props.contact ? props.contact.youtube : "";
  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-md-8 col-md-offset-2 intro-text">
                <h1 className="sr-only">{data.title}</h1>
                <div className="intro-ctas">
                  {whatsapp && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-custom btn-lg btn-whatsapp"
                    >
                      <i className="fa fa-whatsapp"></i> {data.ctaPrimary}
                    </a>
                  )}
                  <a
                    href="#services"
                    className="btn btn-lg btn-outline-light page-scroll"
                  >
                    {data.ctaSecondary}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
