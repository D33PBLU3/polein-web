import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
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
import { Brands } from "./components/brands";
import { Process } from "./components/process";
import { Stats } from "./components/stats";
import { BlogTeaser } from "./components/blogteaser";
import BlogPosts from "./blog/posts.json";
import BlogData from "./blog/blog.json";
import { WhatsAppButton } from "./components/whatsappbutton";
import PrivacyPolicy from './components/PrivacyPolicy';
import JsonData from "./data/data.json";
import { initTracking } from "./utils/analytics";
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
    initTracking();
  }, []);


  const L = landingPageData.Labels || {};
  const whatsapp = landingPageData.Contact ? landingPageData.Contact.youtube : "";
  const contactProps = {
    data: landingPageData.Contact,
    labels: L.contact,
    footer: L.footer,
    privacy: landingPageData.Privacy,
    services: landingPageData.Services,
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={
            <>
              <Navigation labels={L.nav} />
              <Header data={landingPageData.Header} contact={landingPageData.Contact} />
              <Stats data={landingPageData.Stats} />
              <About data={landingPageData.About} labels={L.about} />
              <Features data={landingPageData.Features} labels={L.features} />
              <Services data={landingPageData.Services} labels={L.services} />
              <Brands data={landingPageData.Brands} />
              <Process data={landingPageData.Process} whatsapp={whatsapp} />
              <Tracking data={landingPageData.Tracking} />
              <Clients data={landingPageData.Clients} labels={L.clients} />
              <Gallery data={landingPageData.Gallery} labels={L.gallery} carousel={L.carousel} />
              <Testimonials
                data={landingPageData.Testimonials}
                labels={L.testimonials}
                carousel={L.carousel}
                reviewLink={landingPageData.Contact ? landingPageData.Contact.googleReview || landingPageData.Contact.google : ""}
              />
              <Faq data={landingPageData.Faq} />
              <BlogTeaser posts={BlogPosts} labels={BlogData.teaser} />
              <Contact {...contactProps} />
            </>
          } />
          <Route path="/aviso-de-privacidad" element={
            <PrivacyPolicy data={landingPageData.Privacy} navLabels={L.nav} contactProps={contactProps} />
          } />
          {/* old URL, kept so existing links still work */}
          <Route path="/terms-and-conditions" element={<Navigate to="/aviso-de-privacidad" replace />} />
        </Routes>
        <WhatsAppButton
          link={whatsapp}
          phone={landingPageData.Contact ? landingPageData.Contact.phone : ""}
          labels={L.floating}
        />
      </div>
    </Router>
  );
};

export default App;
