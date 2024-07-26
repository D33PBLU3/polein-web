import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigation } from "./navigation";
import { Header } from "./header";
import JsonData from "../data/data.json";
import App from"../App";

const TermsAndConditions = () => {
  const [landingPageData, setLandingPageData] = useState({});

  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  return (
    <div>
      <Navigation />
      {/* Add the content for the Terms and Conditions page here */}
      <div>
      </div>
    </div>
  );
};

export default TermsAndConditions;