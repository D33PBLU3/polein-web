import React from "react";
import { useLocation } from 'react-router-dom';

export const Navigation = (props) => {
  const location = useLocation();
  const isRootPage = location.pathname === '/';
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
            <span className="sr-only">Toggle navigation</span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
            <span className="icon-bar"></span>{" "}
          </button>
          <a className="navbar-brand page-scroll" href="#page-top">
           
          </a>{" "}
        </div>

        <div
          className="collapse navbar-collapse"
          id="bs-example-navbar-collapse-1"
        >
          <ul className="nav navbar-nav navbar-right">
            <li>
              <a href={isRootPage ? "#features" : "/#features"}  className="page-scroll">
              CARACTERÍSTICAS
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#about" : "/#about"} className="page-scroll">
              ¿QUIÉNES SOMOS?
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#services" : "/#services"} className="page-scroll">
                SERVICIOS
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#portfolio" : "/#portfolio"} className="page-scroll">
                GALERÍA
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#testimonials" : "/#testimonials"} className="page-scroll">
                TESTIMONIOS
              </a>
            </li>
            <li>
              <a href={isRootPage ? "#contact" : "/#contact"} className="page-scroll">
                CONTACTO
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
