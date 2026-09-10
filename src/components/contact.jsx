import { useState } from "react";
import emailjs from "emailjs-com";
import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const initialState = {
  name: "",
  phone: "",
  email: "",
  message: "",
};
export const Contact = (props) => {
  const [{ name, phone, email, message }, setState] = useState(initialState);
  const location = useLocation();
  const isRootPage = location.pathname === "/";
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };
  const clearState = () => setState({ ...initialState });
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setConfirmationMessage('');
    emailjs
      .sendForm(
        "service_polein",
        "template_tz9ijtt",
        e.target,
        "Gb2jANzOJTCSPTPSj"
      )
      .then(
        () => {
          setConfirmationMessage('Gracias por contactarnos. Hemos recibido su mensaje y en breve nos comunicaremos con usted.');
          clearState();
          setIsSubmitting(false);
        },
        () => {
          setConfirmationMessage('Hubo un error al enviar el correo. Inténtalo nuevamente.');
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
                <h2>Contáctanos</h2>
                <p>
                  Le invitamos a completar el siguiente formulario para enviarnos un correo electrónico; con gusto le daremos respuesta a la brevedad.
                </p>
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
                        placeholder="Nombre"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={handleChange}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <div className="form-group">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control"
                        placeholder="Teléfono"
                        required
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={handleChange}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                  <div className="col-xs-12 col-md-6">
                    <div className="form-group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        placeholder="Correo electrónico"
                        required
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={handleChange}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    id="message"
                    className="form-control"
                    rows="4"
                    placeholder="Mensaje"
                    required
                    value={message}
                    onChange={handleChange}
                  ></textarea>
                  <p className="help-block text-danger"></p>
                </div>
                <div id="success"></div>
                {confirmationMessage && (
                  <p className="confirmation-message" role="status" aria-live="polite">
                    {confirmationMessage}
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-custom btn-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </form>
            </div>
          </div>
          <div className="col-xs-12 col-md-3 col-md-offset-1 contact-info">
            <div className="contact-item">
              <h3>Datos de Contacto</h3>
              <p>
                <span>
                  <i className="fa fa-map-marker"></i> Dirección
                </span>
                {props.data ? props.data.address : "loading"}
              </p>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-phone"></i> Teléfono
                </span>{" "}
                {props.data ? props.data.phone : "loading"}
              </p>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-envelope-o"></i> Correo electrónico
                </span>{" "}
                {props.data ? props.data.email : "loading"}
              </p>
            </div>
          </div>
          <div className="col-xs-12 col-md-12">
            <div className="row">
              <div className="social">
                <ul>
                  <li>
                    <a href={props.data ? props.data.youtube : "/"}>
                      <i className="fa fa-whatsapp"></i>
                    </a>
                  </li>
                  <li>
                    <a href={props.data ? props.data.facebook : "/"}>
                      <i className="fa fa-facebook"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="footer">
        <div className="container text-center">
          <p>
            {isRootPage ? (
              <Link to="/terms-and-conditions">Política de Privacidad</Link>
            ) : (
              <></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
