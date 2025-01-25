// src/components/Register.js
import React, { useState } from "react";
import { auth, database } from "../firebaseConfig"; // Importa o Realtime Database
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { ref, set } from "firebase/database"; // Funções do Realtime Database
import {
  faPhone,
  faUserPlus,
  faSpinner,
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import "@sweetalert2/theme-dark/dark.css";
import logo from "./img/name.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [apelido, setApelido] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidName, setIsValidName] = useState(true);
  const navigate = useNavigate();

  const validateName = (name) => /^[a-zA-Z]+(?:\s[a-zA-Z]+)+$/.test(name);
  const validateCelular = (celular) => /^\+55\d{11}$/.test(celular);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const checkPasswordStrength = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!isLongEnough) return "Fraca";
    if (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar)
      return "Forte";
    return "Média";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateName(firstName)) {
      setIsValidName(false);
      return;
    }
    setIsValidName(true);

    if (!validateCelular(celular)) {
      setErrorMessage(
        "Por favor, insira um celular válido no formato +5511999999999."
      );
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }

    if (checkPasswordStrength(password) === "Fraca") {
      Swal.fire({
        icon: "error",
        title: "Senha Fraca",
        text: "A senha deve ter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.",
        confirmButtonText: "Ok",
      });
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não correspondem. Tente novamente.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: apelido });

      // Armazenar dados no Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        firstName,
        apelido,
        celular,
        email,
        createdAt: new Date().toISOString(),
      });

      // Enviar e-mail de verificação
      await sendEmailVerification(user);

      Swal.fire({
        icon: "success",
        title: "Cadastro realizado!",
        text: "Verifique seu e-mail para confirmar sua conta antes de fazer login.",
        confirmButtonText: "Ok",
      });

      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Esse e-mail já está em uso. Tente outro.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("E-mail inválido.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Senha fraca. Escolha uma senha mais forte.");
      } else {
        setErrorMessage(`Erro ao registrar: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Bubble Safe Chat - Registro</title>
      </Helmet>
      <img
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", width: "300px" }}
        src={logo}
        alt="Bubble Safe Chat"
      />
      <h1>Registrar</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleRegister}>
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
          </div>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Nome Completo"
            className={`mt-2 ${!isValidName ? "is-invalid" : ""}`}
            required
            autoComplete="name"
          />
          {!isValidName && (
            <div className="invalid-feedback">Por favor, insira um nome válido.</div>
          )}
        </div>
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faUser} className="input-icon" />
          </div>
          <input
            type="text"
            value={apelido}
            onChange={(e) => setApelido(e.target.value)}
            placeholder="Apelido"
            className={`mt-2 ${apelido.trim() === "" ? "is-invalid" : ""}`}
            required
            autoComplete="nickname"
          />
          {apelido.trim() === "" && (
            <div className="invalid-feedback">Por favor, insira um apelido.</div>
          )}
        </div>
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faPhone} className="input-icon" />
          </div>
          <input
            type="tel"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            placeholder="Celular (+5511999999999)"
            required
            className={`mt-2 ${
              !validateCelular(celular) && celular !== "" ? "is-invalid" : ""
            }`}
            autoComplete="tel"
          />
          {!validateCelular(celular) && celular !== "" && (
            <div className="invalid-feedback">
              Por favor, insira um celular válido no formato +5511999999999.
            </div>
          )}
        </div>
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="mt-2"
            autoComplete="email"
          />
        </div>
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            className="mt-2"
            autoComplete="new-password"
          />
          <span onClick={togglePasswordVisibility} className="eye-icon">
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar Senha"
            required
            className="mt-2"
            autoComplete="new-password"
          />
          <span onClick={togglePasswordVisibility} className="eye-icon">
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>
        {password !== confirmPassword && (
          <p className="error-message">As senhas não correspondem. Tente novamente.</p>
        )}
        <button
          type="submit"
          style={{ height: "50px", fontWeight: "500", fontSize: "16px" }}
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
          ) : (
            "Registrar"
          )}
        </button>
      </form>
      <p className="btn-redpass">
        Já tem uma conta?{" "}
        <span
          onClick={() => navigate("/login")}
          style={{
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Register;
