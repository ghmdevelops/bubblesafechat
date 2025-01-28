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
import { ref, set, query, orderByChild, equalTo, get } from "firebase/database"; // Funções do Realtime Database
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
  const [firstName, setFirstName] = useState("marcos silva");
  const [apelido, setApelido] = useState("marc9403");
  const [celular, setCelular] = useState("+5511981835197");
  const [email, setEmail] = useState("tell3rv@outlook.com");
  const [password, setPassword] = useState("Geh@2021");
  const [confirmPassword, setConfirmPassword] = useState("Geh@2021");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidName, setIsValidName] = useState(true);
  const [isCelularAvailable, setIsCelularAvailable] = useState(true);
  const [isApelidoAvailable, setIsApelidoAvailable] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    score: 0,
    color: "#dc3545",
  });
  const navigate = useNavigate();

  // Funções de validação
  const validateName = (name) => /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim()); // Permite letras com acentos e espaços
  const validateCelular = (celular) => /^\+55\d{11}$/.test(celular);
  const validateApelido = (apelido) => /^[a-zA-Z0-9_]{3,20}$/.test(apelido); // Apelido de 3 a 20 caracteres, letras, números e underscores

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
    setIsCelularAvailable(true);
    setIsApelidoAvailable(true); // Resetar estado de disponibilidade do apelido

    // Validação do Nome Completo
    if (!validateName(firstName)) {
      setIsValidName(false);
      Swal.fire({
        icon: "error",
        title: "Nome Inválido",
        text: "Por favor, insira um nome válido contendo apenas letras e espaços.",
        confirmButtonText: "Ok",
      });
      return;
    }
    setIsValidName(true);

    // Validação do Apelido
    if (!validateApelido(apelido)) {
      setErrorMessage(
        "Apelido inválido. Use 3-20 caracteres: letras, números e underscores."
      );
      Swal.fire({
        icon: "error",
        title: "Apelido Inválido",
        text: "O apelido deve ter entre 3 e 20 caracteres e pode conter letras, números e underscores.",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Validação do Celular
    if (!validateCelular(celular)) {
      setErrorMessage(
        "Por favor, insira um celular válido no formato +5511999999999."
      );
      Swal.fire({
        icon: "error",
        title: "Celular Inválido",
        text: "O número de celular deve estar no formato +5511999999999.",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Validação do Email
    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      Swal.fire({
        icon: "error",
        title: "Email Inválido",
        text: "Por favor, insira um endereço de email válido.",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Validação da Força da Senha
    if (checkPasswordStrength(password).label === "Fraca") {
      Swal.fire({
        icon: "error",
        title: "Senha Fraca",
        text: "A senha deve ter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Validação de Comprimento da Senha
    if (password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      Swal.fire({
        icon: "error",
        title: "Senha Curta",
        text: "A senha deve ter no mínimo 6 caracteres.",
        confirmButtonText: "Ok",
      });
      return;
    }

    // Validação de Confirmação da Senha
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não correspondem. Tente novamente.");
      Swal.fire({
        icon: "error",
        title: "Senhas Não Correspondem",
        text: "As senhas digitadas não correspondem. Por favor, tente novamente.",
        confirmButtonText: "Ok",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verificar se o número de celular já está em uso
      const celularQuery = query(
        ref(database, "users"),
        orderByChild("celular"),
        equalTo(celular)
      );
      console.log("Executando consulta para celular:", celular);
      const celularSnapshot = await get(celularQuery);
      console.log(
        "Resultado da consulta de celular:",
        celularSnapshot.exists()
      );

      if (celularSnapshot.exists()) {
        setErrorMessage("Este número de celular já está em uso.");
        setIsCelularAvailable(false);
        Swal.fire({
          icon: "error",
          title: "Celular Já Registrado",
          text: "Este número de celular já está em uso. Por favor, use outro.",
          confirmButtonText: "Ok",
        });
        setIsLoading(false);
        return;
      }

      // 2. Verificar se o apelido já está em uso
      const apelidoQuery = query(
        ref(database, "users"),
        orderByChild("apelido"),
        equalTo(apelido)
      );
      console.log("Executando consulta para apelido:", apelido);
      const apelidoSnapshot = await get(apelidoQuery);
      console.log(
        "Resultado da consulta de apelido:",
        apelidoSnapshot.exists()
      );

      if (apelidoSnapshot.exists()) {
        setErrorMessage("Este apelido já está em uso.");
        setIsApelidoAvailable(false);
        Swal.fire({
          icon: "error",
          title: "Apelido Já Registrado",
          text: "Este apelido já está em uso. Por favor, escolha outro.",
          confirmButtonText: "Ok",
        });
        setIsLoading(false);
        return;
      }

      // 3. Criar o usuário no Firebase Authentication
      console.log("Criando usuário com email:", email);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Usuário criado com UID:", user.uid);

      // Verifique se o usuário está autenticado
      if (!auth.currentUser) {
        console.error("Usuário não autenticado!");
        Swal.fire({
          icon: "error",
          title: "Erro de Permissão",
          text: "Você não está autenticado. Por favor, faça login novamente.",
          confirmButtonText: "Ok",
        });
        return;
      }

      console.log("Usuário autenticado com UID:", auth.currentUser.uid);

      // 4. Atualizar o perfil do usuário com o apelido
      await updateProfile(user, { displayName: apelido });
      console.log("Perfil do usuário atualizado com apelido:", apelido);

      // 5. Armazenar os dados do usuário no Realtime Database
      await set(ref(database, `users/${user.uid}`), {
        firstName: firstName.trim(),
        apelido: apelido.trim(),
        celular,
        email: email.trim(),
        createdAt: new Date().toISOString(),
      });
      console.log("Dados do usuário armazenados no Realtime Database");

      // 6. Enviar e-mail de verificação
      await sendEmailVerification(user);
      console.log("E-mail de verificação enviado para:", email);

      // 7. Exibir mensagem de sucesso e redirecionar
      Swal.fire({
        icon: "success",
        title: "Cadastro Realizado!",
        text: "Verifique seu e-mail para confirmar sua conta antes de fazer login.",
        confirmButtonText: "Ok",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Esse e-mail já está em uso. Tente outro.");
        Swal.fire({
          icon: "error",
          title: "Email Já Registrado",
          text: "Este e-mail já está em uso. Por favor, use outro.",
          confirmButtonText: "Ok",
        });
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("E-mail inválido.");
        Swal.fire({
          icon: "error",
          title: "Email Inválido",
          text: "O endereço de email fornecido é inválido.",
          confirmButtonText: "Ok",
        });
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Senha fraca. Escolha uma senha mais forte.");
        Swal.fire({
          icon: "error",
          title: "Senha Fraca",
          text: "A senha fornecida é muito fraca. Por favor, escolha uma senha mais forte.",
          confirmButtonText: "Ok",
        });
      } else if (error.message.includes("Permission denied")) {
        setErrorMessage(
          "Erro de permissão: Você não tem autorização para realizar esta operação."
        );
        Swal.fire({
          icon: "error",
          title: "Erro de Permissão",
          text: "Você não tem autorização para realizar esta operação. Por favor, tente novamente mais tarde.",
          confirmButtonText: "Ok",
        });
      } else {
        setErrorMessage(`Erro ao registrar: ${error.message}`);
        Swal.fire({
          icon: "error",
          title: "Erro no Registro",
          text: `Ocorreu um erro ao registrar o usuário: ${error.message}`,
          confirmButtonText: "Ok",
        });
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
      {/* Removido o parágrafo de erro para utilizar apenas Swal */}

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
            className={`mt-2 ${
              !isApelidoAvailable || !validateApelido(apelido)
                ? "is-invalid"
                : ""
            }`}
            required
            autoComplete="nickname"
          />
          {(!isApelidoAvailable || !validateApelido(apelido)) && (
            <div className="invalid-feedback">
              Apelido inválido ou já em uso.
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
              !validateCelular(celular) && celular !== ""
                ? "is-invalid"
                : !isCelularAvailable && celular !== ""
                ? "is-invalid"
                : ""
            }`}
            autoComplete="tel"
          />
          {!validateCelular(celular) && celular !== "" && (
            <div className="invalid-feedback">
              Por favor, insira um celular válido no formato +5511999999999.
            </div>
          )}
          {!isCelularAvailable && celular !== "" && (
            <div className="invalid-feedback">
              Este número de celular já está em uso.
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
            onChange={handlePasswordChange}
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

        {/* Mensagem de Erro para Senhas Não Correspondentes */}
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
