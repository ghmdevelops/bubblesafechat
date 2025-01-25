// src/components/ResetPassword.js
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "@sweetalert2/theme-dark/dark.css";
import logo from "./img/name.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faSpinner,
  faArrowLeft,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setResetMessage("");

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      await auth.sendPasswordResetEmail(email);
      Swal.fire({
        icon: "success",
        title: "E-mail Enviado!",
        text: "Um e-mail para redefinição de senha foi enviado. Verifique sua caixa de entrada ou lixo eletrônico.",
        confirmButtonText: "Ok",
      });
      setResetMessage("Um e-mail para redefinição de senha foi enviado.");
      setEmail("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setErrorMessage(
          "E-mail não encontrado. Verifique se o e-mail está correto."
        );
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("E-mail inválido. Verifique o formato.");
      } else {
        setErrorMessage(
          "Erro ao enviar o e-mail de redefinição. Tente novamente mais tarde."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Bubble Safe Chat - Redefinir Senha</title>
      </Helmet>

      <img
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", width: "300px" }}
        src={logo}
        alt="Bubble Safe Chat"
      />
      <h1>Redefinir Senha</h1>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {resetMessage && <p className="success-message">{resetMessage}</p>}

      <form onSubmit={handlePasswordReset}>
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu Email"
            required
            autoComplete="email"
            className="mt-2"
          />
        </div>

        <button
          type="submit"
          style={{ height: "50px", fontWeight: "500", fontSize: "16px" }}
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="spinner-container">
              <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
            </div>
          ) : (
            <>
              <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
              Enviar E-mail
            </>
          )}
        </button>

        <button
          type="button"
          style={{ height: "50px" }}
          className="btn btn-secondary mt-2"
          onClick={() => navigate("/login")}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Voltar para Login
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
