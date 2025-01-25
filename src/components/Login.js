import { BsFillDoorOpenFill } from "react-icons/bs"; 
import { BsFacebook } from "react-icons/bs";
import { AiFillGithub } from "react-icons/ai";
import { BsGoogle } from "react-icons/bs";
// src/components/Login.js
import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Swal from "sweetalert2";
import "@sweetalert2/theme-dark/dark.css";
import logo from "./img/name.png";
import googleIcon from "./img/icon-google.png";
import "./AuthExample.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  faPaperPlane,
  faArrowLeft,
  faSignInAlt,
  faUserPlus,
  faSpinner,
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

library.add(faGoogle);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const navigate = useNavigate();
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutos

  useEffect(() => {
    const storedLockout = localStorage.getItem("isLockedOut");

    if (storedLockout === "true") {
      setIsLockedOut(true);
      setLockoutMessage(
        "Sua conta está bloqueada. Redefina sua senha e aguarde 3 minutos para acessar novamente."
      );
      const lockoutStart = localStorage.getItem("lockoutStartTime");
      if (lockoutStart) {
        const elapsed = Date.now() - Number(lockoutStart);
        if (elapsed < LOCKOUT_DURATION_MS) {
          const remaining = LOCKOUT_DURATION_MS - elapsed;
          const timer = setTimeout(() => {
            setIsLockedOut(false);
            setLockoutMessage("");
            setLoginAttempts(0);
            localStorage.removeItem("isLockedOut");
            localStorage.removeItem("loginAttempts");
            localStorage.removeItem("lockoutStartTime");
          }, remaining);
          return () => clearTimeout(timer);
        } else {
          setIsLockedOut(false);
          setLockoutMessage("");
          setLoginAttempts(0);
          localStorage.removeItem("isLockedOut");
          localStorage.removeItem("loginAttempts");
          localStorage.removeItem("lockoutStartTime");
        }
      }
    }

    const storedAttempts = localStorage.getItem("loginAttempts");
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isLockedOut) {
      Swal.fire({
        icon: "warning",
        title: "Conta bloqueada",
        text: "Você deve redefinir sua senha antes de tentar fazer login.",
        confirmButtonText: "Ok",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        Swal.fire({
          icon: "success",
          title: "Login bem-sucedido",
          html: "Você foi logado com sucesso. Irei fechar em <b></b> milissegundos.",
          timer: 900,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b");
            setInterval(() => {
              timer.textContent = Swal.getTimerLeft();
            }, 100);
          },
        }).then(() => {
          navigate("/");
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "E-mail não verificado",
          text: "Por favor, verifique seu e-mail antes de fazer login.",
          confirmButtonText: "Ok",
        });
        auth.signOut();
      }
    } catch (error) {
      const maxAttempts = MAX_ATTEMPTS;
      const attemptsLeft = maxAttempts - (loginAttempts + 1);
      setLoginAttempts((prev) => prev + 1);
      localStorage.setItem("loginAttempts", loginAttempts + 1);

      if (loginAttempts + 1 >= maxAttempts) {
        setIsLockedOut(true);
        setLockoutMessage(
          "Sua conta está bloqueada. Redefina sua senha e aguarde 3 minutos para acessar novamente."
        );
        localStorage.setItem("isLockedOut", "true");
        localStorage.setItem("lockoutStartTime", Date.now().toString());

        Swal.fire({
          icon: "error",
          title: "Conta bloqueada",
          text: `Você excedeu o número de tentativas de login. Sua conta está bloqueada por 3 minutos.`,
          confirmButtonText: "Ok",
        });
      } else {
        if (error.code === "auth/user-not-found") {
          Swal.fire({
            icon: "error",
            title: "E-mail não cadastrado",
            text: "Esse e-mail não está registrado. Por favor, verifique ou crie uma nova conta.",
            confirmButtonText: "Ok",
          });
        } else if (error.code === "auth/wrong-password") {
          Swal.fire({
            icon: "error",
            title: "Senha incorreta",
            text: `Senha incorreta. Você tem ${attemptsLeft} tentativas restantes. Considere redefinir sua senha.`,
            confirmButtonText: "Ok",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Erro ao fazer login",
            text: "Não foi possível fazer login. Verifique as informações e tente novamente.",
            confirmButtonText: "Ok",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      Swal.fire({
        icon: "success",
        title: "Login com Google bem-sucedido",
        html: "Você foi logado com sucesso usando sua conta Google. Irei fechar em <b></b> milissegundos.",
        timer: 1600,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          let timerInterval = setInterval(() => {
            timer.textContent = Swal.getTimerLeft();
          }, 100);
          Swal.getPopup().on("close", () => {
            clearInterval(timerInterval);
          });
        },
        willClose: () => {},
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        Swal.fire({
          icon: "warning",
          title: "Autenticação interrompida",
          text: "A janela de autenticação foi fechada. Tente novamente.",
          confirmButtonText: "Ok",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro no login com Google",
          text: "Erro ao fazer login com Google. Tente novamente.",
          confirmButtonText: "Ok",
        });
        console.error("Erro ao fazer login com Google:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    const provider = new GithubAuthProvider();
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      Swal.fire({
        icon: "success",
        title: "Login com GitHub bem-sucedido",
        text: "Você foi logado com sucesso usando sua conta GitHub.",
        timer: 1600,
        timerProgressBar: true,
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro no login com GitHub",
        text: "Erro ao fazer login com GitHub. Tente novamente.",
        confirmButtonText: "Ok",
      });
      console.error("Erro ao fazer login com GitHub:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      Swal.fire({
        icon: "success",
        title: "Login com Facebook bem-sucedido",
        text: "Você foi logado com sucesso usando sua conta do Facebook.",
        timer: 1600,
        timerProgressBar: true,
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro no login com Facebook",
        text: "Erro ao fazer login com Facebook. Tente novamente.",
        confirmButtonText: "Ok",
      });
      console.error("Erro ao fazer login com Facebook:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Bubble Safe Chat - Login</title>
        {/* ...metatags restantes */}
      </Helmet>

      <img
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", width: "300px" }}
        src={logo}
        alt="OpenSecurityRoom"
      />
      <h1>Login</h1>

      {lockoutMessage && <p className="error-message">{lockoutMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form onSubmit={handleLogin}>
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
            autoComplete="email"
            className="mt-2"
          />
        </div>

        <div className={`input-icon-container ${password ? "password" : ""}`}>
          <div className="icon-background">
            <FontAwesomeIcon icon={faLock} className="input-icon" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            autoComplete="current-password"
            className="mt-2"
          />
          <span onClick={togglePasswordVisibility} className="eye-icon">
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </span>
        </div>

        <button
          type="submit"
          style={{ height: "50px", fontWeight: "500", fontSize: "16px" }}
          className="btn btn-primary"
          disabled={isLoading || isLockedOut}
        >
          {isLoading ? (
            <div className="spinner-container">
              <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
            </div>
          ) : (
            <>
              <BsFillDoorOpenFill size={20}/>
              Accessing Room 
            </>
          )}
        </button>

        <div className="d-flex justify-content-center gap-3 mt-4 div-btn-log">
          <button
            type="button"
            className="btn btn-primary btn-social google-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading || isLockedOut}
          >
            {isLoading ? (
              "Carregando..."
            ) : (
              <>
                <BsGoogle size={24} />
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-social github-btn"
            onClick={handleGithubLogin}
            disabled={isLoading || isLockedOut}
          >
            {isLoading ? (
              "Carregando..."
            ) : (
              <>
                <AiFillGithub size={30} />
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-social facebook-btn"
            onClick={handleFacebookLogin}
            disabled={isLoading || isLockedOut}
          >
            {isLoading ? (
              "Carregando..."
            ) : (
              <>
                <BsFacebook size={24} />
              </>
            )}
          </button>
        </div>
      </form>

      <p className="btn-redpass">
        Esqueceu sua senha?{" "}
        <span onClick={() => navigate("/reset-password")}>Redefinir senha</span>
      </p>

      <p className="btn-redpass">
        Não tem uma conta?{" "}
        <span onClick={() => navigate("/register")}>Registrar</span>
      </p>
    </div>
  );
};

export default Login;
