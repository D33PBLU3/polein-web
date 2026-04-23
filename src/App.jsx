import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Features } from "./components/features";
import { About } from "./components/about";
import { Services } from "./components/services";
import { Clients } from "./components/clients";
import { Tracking } from "./components/tracking";
import { Faq } from "./components/faq";
import { Gallery } from "./components/gallery";
import { Testimonials } from "./components/testimonials";
import { Contact } from "./components/contact";
import { Stats } from "./components/stats";
import { WhatsAppButton } from "./components/whatsappbutton";
import TermsAndConditions from './components/TermsAndConditions';
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";

export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);


  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={
            <>
              <Navigation data={landingPageData.Contact} />
              <Header data={landingPageData.Header} />
              <Stats data={landingPageData.Stats} />
              <About data={landingPageData.About} />
              <Features data={landingPageData.Features} />
              <Services data={landingPageData.Services} />
              <Tracking data={landingPageData.Tracking} />
              <Clients data={landingPageData.Clients} />
              <Gallery data={landingPageData.Gallery} />
              <Testimonials data={landingPageData.Testimonials} />
              <Faq data={landingPageData.Faq} />
              <Contact data={landingPageData.Contact} />
            </>
          } />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        </Routes>
        <WhatsAppButton
          link={landingPageData.Contact ? landingPageData.Contact.youtube : ""}
          phone={landingPageData.Contact ? landingPageData.Contact.phone : ""}
        />
      </div>
    </Router>
  );
};

export default App;
