import { useState } from "react";
import emailjs from "emailjs-com";
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { trackEvent, getVisitSource } from "../utils/analytics";

const initialState = {
  name: "",
  phone: "",
  email: "",
  service_type: "",
  equipment: "",
  lead_source: "",
  message: "",
};

const telHref = (phone) => `tel:${phone.replace(/\s/g, "")}`;

export const Contact = (props) => {
  const [form, setState] = useState(initialState);
  const location = useLocation();
  const isRootPage = location.pathname === "/";
  const data = props.data || {};
  const L = props.labels || {};
  const F = L.fields || {};
  const services = props.services || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };
  const clearState = () => setState({ ...initialState });
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setConfirmationMessage("");
    // Service type and equipment are also prepended to the message, so they
    // show in the email even if the EmailJS template doesn't use
    // {{service_type}} / {{equipment}} / {{lead_source}} / {{visit_source}}.
    const visitSource = getVisitSource();
    const details = [
      form.service_type && `${F.serviceType}: ${form.service_type}`,
      form.equipment && `${F.equipment}: ${form.equipment}`,
      form.lead_source && `${F.leadSource}: ${form.lead_source}`,
      visitSource && `${F.visitSource}: ${visitSource}`,
    ]
      .filter(Boolean)
      .join("\n");
    const params = {
      ...form,
      visit_source: visitSource,
      message: details ? `${details}\n\n${form.message}` : form.message,
    };
    emailjs
      .send("service_polein", "template_tz9ijtt", params, "Gb2jANzOJTCSPTPSj")
      .then(
        () => {
          trackEvent("generate_lead", {
            location: "contact_form",
            lead_source: form.lead_source || "sin respuesta",
          });
          setConfirmationMessage(L.success);
          clearState();
          setIsSubmitting(false);
        },
        () => {
          setConfirmationMessage(L.error);
          setIsSubmitting(false);
        }
      );
  };

  return (
    <div>
      <div id="contact">
        <div className="container">
          <div className="col-xs-12 col-md-8">
            <div className="row">
              <div className="section-title">
                <h2>{L.title}</h2>
                <p>{L.intro}</p>
              </div>
              <form name="sentMessage" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-xs-12 col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        placeholder={F.name}
                        aria-label={F.name}
                        required
                        autoComplete="name"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <div className="form-group">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control"
                        placeholder={F.phone}
                        aria-label={F.phone}
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <div className="form-group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        placeholder={F.email}
                        aria-label={F.email}
                        inputMode="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <div className="form-group">
                      <select
                        id="service_type"
                        name="service_type"
                        className={`form-control${form.service_type ? "" : " is-placeholder"}`}
                        aria-label={F.serviceType}
                        value={form.service_type}
                        onChange={handleChange}
                      >
                        <option value="">{F.serviceTypePlaceholder}</option>
                        {services.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                        <option value={F.serviceTypeOther}>{F.serviceTypeOther}</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-xs-12">
                    <div className="form-group">
                      <input
                        type="text"
                        id="equipment"
                        name="equipment"
                        className="form-control"
                        placeholder={F.equipmentPlaceholder}
                        aria-label={F.equipment}
                        value={form.equipment}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-xs-12">
                    <div className="form-group">
                      <select
                        id="lead_source"
                        name="lead_source"
                        className={`form-control${form.lead_source ? "" : " is-placeholder"}`}
                        aria-label={F.leadSource}
                        value={form.lead_source}
                        onChange={handleChange}
                      >
                        <option value="">{F.leadSourcePlaceholder}</option>
                        {(F.leadSourceOptions || []).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    id="message"
                    className="form-control"
                    rows="4"
                    placeholder={F.message}
                    aria-label={F.message}
                    required
                    value={form.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                {confirmationMessage && (
                  <p className="confirmation-message" role="status" aria-live="polite">
                    {confirmationMessage}
                  </p>
                )}
                {props.privacy && (
                  <p className="form-privacy-notice">
                    {props.privacy.formNotice}{" "}
                    <Link to="/aviso-de-privacidad">{props.privacy.linkLabel}</Link>.
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-custom btn-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? L.submitting : L.submit}
                </button>
              </form>
            </div>
          </div>
          <div className="col-xs-12 col-md-3 col-md-offset-1 contact-info">
            <div className="contact-item">
              <h3>{L.infoTitle}</h3>
              <p>
                <span>
                  <i className="fa fa-map-marker"></i> {L.address}
                </span>
                {data.address}
              </p>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-phone"></i> {L.phone}
                </span>
                {data.phone && <a href={telHref(data.phone)}>{data.phone}</a>}
              </p>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-envelope-o"></i> {L.email}
                </span>
                {data.email && <a href={`mailto:${data.email}`}>{data.email}</a>}
              </p>
            </div>
            {data.hours && (
              <div className="contact-item">
                <p>
                  <span>
                    <i className="fa fa-clock-o"></i> {L.hours}
                  </span>
                  {data.hours}
                </p>
              </div>
            )}
          </div>
          <div className="col-xs-12 col-md-12">
            <div className="row">
              <div className="social">
                <ul>
                  {/* Legacy keys: youtube = WhatsApp, twitter = Instagram */}
                  {data.youtube && (
                    <li>
                      <a href={data.youtube} target="_blank" rel="noopener noreferrer" aria-label={L.whatsapp}>
                        <i className="fa fa-whatsapp"></i>
                      </a>
                    </li>
                  )}
                  {data.facebook && (
                    <li>
                      <a href={data.facebook} target="_blank" rel="noopener noreferrer" aria-label={L.facebook}>
                        <i className="fa fa-facebook"></i>
                      </a>
                    </li>
                  )}
                  {data.google && (
                    <li>
                      <a href={data.google} target="_blank" rel="noopener noreferrer" aria-label={L.google}>
                        <i className="fa fa-google"></i>
                      </a>
                    </li>
                  )}
                  {data.twitter && (
                    <li>
                      <a href={data.twitter} target="_blank" rel="noopener noreferrer" aria-label={L.instagram}>
                        <i className="fa fa-instagram"></i>
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="footer">
        <div className="container text-center">
          <p className="footer-nap">
            <strong>Polein</strong>
            {data.address && <> · {data.address}</>}
            {data.phone && (
              <>
                {" · "}
                <a href={telHref(data.phone)}>{data.phone}</a>
              </>
            )}
            {data.email && (
              <>
                {" · "}
                <a href={`mailto:${data.email}`}>{data.email}</a>
              </>
            )}
          </p>
          {data.hours && (
            <p>
              {L.hours}: {data.hours}
            </p>
          )}
          <p className="footer-legal">
            © {new Date().getFullYear()} {props.footer ? props.footer.company : ""}{" "}
            {props.footer ? props.footer.rights : ""}
            {isRootPage && props.privacy && (
              <>
                {" · "}
                <Link to="/aviso-de-privacidad">{props.privacy.linkLabel}</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
