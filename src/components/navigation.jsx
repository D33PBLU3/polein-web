import React from "react";
import { useLocation } from 'react-router-dom';

export const Navigation = (props) => {
  const location = useLocation();
  const isRootPage = location.pathname === '/';
  const L = props.labels || {};
  return (
    <nav id="menu" className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-example-navbar-collapse-1"
          >
            {" "}
            <span className="sr-only">{L.toggle}</span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
          </button>
          <a className="navbar-brand page-scroll" href="#page-top">
            <img src="img/logo/logo2.jpg" alt={L.logoAlt} className="nav-logo" />
          </a>{" "}
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <a href={isRootPage ? "#about" : "/#about"} className="page-scroll">
                {L.about}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#features" : "/#features"} className="page-scroll">
                {L.features}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#services" : "/#services"} className="page-scroll">
                {L.services}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#tracking" : "/#tracking"} className="page-scroll">
                {L.tracking}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#clients" : "/#clients"} className="page-scroll">
                {L.clients}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#portfolio" : "/#portfolio"} className="page-scroll">
                {L.gallery}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#testimonials" : "/#testimonials"} className="page-scroll">
                {L.testimonials}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#faq" : "/#faq"} className="page-scroll">
                {L.faq}
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#contact" : "/#contact"} className="page-scroll">
                {L.contact}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
