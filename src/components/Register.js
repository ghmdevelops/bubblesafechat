// src/components/Register.js
import React, { useState } from "react";
import { auth, database } from "../firebaseConfig"; // Importa o Realtime Database
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
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
import "./Register.css"; // Certifique-se de importar o CSS relevante

const Register = () => {
  // Estados iniciais
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
  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    score: 0,
    color: "#dc3545",
  });
  const navigate = useNavigate();

  // Funções de validação
  const validateName = (name) => /^[a-zA-Z]+(?:\s[a-zA-Z]+)+$/.test(name);
  const validateCelular = (celular) => /^\+55\d{11}$/.test(celular);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    if (strength <= 2) return { label: "Fraca", score: 20, color: "#dc3545" }; // Vermelho
    if (strength === 3) return { label: "Média", score: 60, color: "#ffc107" }; // Amarelo
    if (strength >= 4) return { label: "Forte", score: 100, color: "#28a745" }; // Verde
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const strength = checkPasswordStrength(newPassword);
    setPasswordStrength(strength);
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

    if (checkPasswordStrength(password).label === "Fraca") {
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
        <title>Bubble Safe Chat - Registrar</title>
      </Helmet>
      <img
        className="icon-paf3"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", width: "300px" }}
        src={logo}
        alt="Bubble Safe Chat"
      />
      <h1>Registrar</h1>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <form onSubmit={handleRegister}>
        {/* Campo Nome Completo */}
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
            <div className="invalid-feedback">
              Por favor, insira um nome válido.
            </div>
          )}
        </div>

        {/* Campo Apelido */}
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
            <div className="invalid-feedback">
              Por favor, insira um apelido.
            </div>
          )}
        </div>

        {/* Campo Celular */}
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

        {/* Campo Email */}
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

        {/* Campo Senha */}
        <div className="input-icon-container">
          <div className="icon-background">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange} // Atualizado para usar handlePasswordChange
            placeholder="Senha"
            required
            className="mt-2"
            autoComplete="new-password"
          />
          <span onClick={togglePasswordVisibility} className="eye-icon">
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>

        {/* Campo Confirmar Senha */}
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

        {/* Medidor de Força de Senha */}
        {password && (
          <div className="password-strength-meter mt-2">
            <div className="progress">
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${passwordStrength.score}%`,
                  backgroundColor: `${passwordStrength.color}`,
                }}
                aria-valuenow={passwordStrength.score}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <small style={{ color: passwordStrength.color }}>
              Força da Senha: {passwordStrength.label}
            </small>
          </div>
        )}

        {password !== confirmPassword && (
          <p className="error-message">
            As senhas não correspondem. Tente novamente.
          </p>
        )}

        {/* Botão de Registro */}
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

      {/* Link para Login */}
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
