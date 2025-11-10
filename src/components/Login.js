import React, { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "../firebaseConfig";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  sendEmailVerification,
} from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from "./img/name.png";
import {
  faSpinner,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { BsFillDoorOpenFill, BsGoogle } from "react-icons/bs";
import { AiFillGithub } from "react-icons/ai";
import Swal from "sweetalert2";
import MobileCtaModal from './MobileCtaModal';
import PromoModal from './PromoModal';
import "./Login.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayedPassword, setDisplayedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [hiddenIndices, setHiddenIndices] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");
  const navigate = useNavigate();
  const animationInterval = useRef(null);

  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 3 * 60 * 1000;

  const [isPasswordless, setIsPasswordless] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [isSendingLink, setIsSendingLink] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCtaModal, setShowCtaModal] = useState(false);

  const actionCodeSettings = {
    url: "https://bubblesafechat.com.br/#/magic-link",
    handleCodeInApp: true,
  };

  const showMobileCtaModal = useCallback(() => {
    if (!isMobile) return;

    setShowCtaModal(true);
  }, [isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setCanInstall(false);
    } else {
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setCanInstall(false);
      setDeferredPrompt(null);

      Swal.fire({
        icon: "success",
        title: "Instalação Iniciada",
        text: "O aplicativo está sendo instalado. Encontre-o na sua tela inicial!",
        confirmButtonText: "Ok",
      });
    }
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      navigate("/magic-link");
    }

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
          animationInterval.current = setTimeout(() => {
            setIsLockedOut(false);
            setLockoutMessage("");
            setLoginAttempts(0);
            localStorage.removeItem("isLockedOut");
            localStorage.removeItem("loginAttempts");
            localStorage.removeItem("lockoutStartTime");
          }, remaining);
          return () => clearTimeout(animationInterval.current);
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

    return () => {
      if (animationInterval.current) {
        clearTimeout(animationInterval.current);
      }
    };
  }, [navigate]);

  const revealPassword = () => {
    if (password.length === 0) return;

    let indices = Array.from({ length: password.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let currentRevealed = [];

    animationInterval.current = setInterval(() => {
      if (indices.length === 0) {
        clearInterval(animationInterval.current);
        setDisplayedPassword(password);
        return;
      }

      const nextIndex = indices.shift();
      currentRevealed = [...revealedIndices, nextIndex];
      setRevealedIndices(currentRevealed);

      const newDisplayedPassword = password
        .split("")
        .map((char, idx) => (currentRevealed.includes(idx) ? char : "•"))
        .join("");
      setDisplayedPassword(newDisplayedPassword);
    }, 100);
  };

  const hidePassword = () => {
    if (password.length === 0) return;

    let indices = Array.from({ length: password.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    let currentHidden = [];

    animationInterval.current = setInterval(() => {
      if (indices.length === 0) {
        clearInterval(animationInterval.current);
        setDisplayedPassword("•".repeat(password.length));
        return;
      }

      const nextIndex = indices.shift();
      currentHidden = [...hiddenIndices, nextIndex];
      setHiddenIndices(currentHidden);

      const newDisplayedPassword = password
        .split("")
        .map((char, idx) => (currentHidden.includes(idx) ? "•" : char))
        .join("");
      setDisplayedPassword(newDisplayedPassword);
    }, 100);
  };

  const togglePasswordVisibility = () => {
    if (!showPassword) {
      setShowPassword(true);
      setDisplayedPassword("•".repeat(password.length));
      setRevealedIndices([]);
      setHiddenIndices([]);
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
      revealPassword();
    } else {
      setShowPassword(false);
      setDisplayedPassword(password);
      setRevealedIndices([]);
      setHiddenIndices([]);
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
      hidePassword();
    }
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
            const interval = setInterval(() => {
              timer.textContent = Swal.getTimerLeft();
            }, 100);
            Swal.getPopup().addEventListener("close", () => {
              clearInterval(interval);
            });
          },
        }).then(() => {
          navigate("/");
        });
      } else {
        await sendEmailVerification(user);
        Swal.fire({
          icon: "warning",
          title: "E-mail não verificado",
          text: "Um e-mail de verificação foi enviado novamente. Por favor, verifique seu e-mail, inclusive a pasta de lixo eletrônico.",
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
      await signInWithPopup(auth, provider);
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
          Swal.getPopup().addEventListener("close", () => {
            clearInterval(timerInterval);
          });
        },
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
      await signInWithPopup(auth, provider);
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

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const MAGIC_LINK_COOLDOWN = 60 * 1000;
    const lastRequestTime = localStorage.getItem("lastMagicLinkRequestTime");
    const now = Date.now();

    if (lastRequestTime && now - lastRequestTime < MAGIC_LINK_COOLDOWN) {
      const remainingTime = Math.ceil(
        (MAGIC_LINK_COOLDOWN - (now - lastRequestTime)) / 1000
      );
      Swal.fire({
        icon: "info",
        title: "Aguarde antes de tentar novamente",
        text: `Você já solicitou um link de login recentemente. Por favor, aguarde ${remainingTime} segundos antes de tentar novamente.`,
        confirmButtonText: "Entendido",
      });
      return;
    }

    setIsSendingLink(true);

    try {
      await sendSignInLinkToEmail(auth, magicEmail, actionCodeSettings);
      localStorage.setItem("lastMagicLinkRequestTime", now);
      window.localStorage.setItem("emailForSignIn", magicEmail);

      Swal.fire({
        icon: "success",
        title: "Link enviado com sucesso!",
        text: "Verifique seu e-mail (e a pasta de spam, se necessário) para acessar o link de login.",
        confirmButtonText: "Ok",
      });
      setMagicEmail("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao enviar link",
        text:
          error.message ||
          "Não foi possível enviar o link de login. Tente novamente mais tarde.",
        confirmButtonText: "Entendido",
      });
      console.error("Erro ao enviar link mágico:", error);
    } finally {
      setIsSendingLink(false);
    }
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Bubble Safe Chat - Login</title>
      </Helmet>

      <PromoModal onPromoSeen={showMobileCtaModal} />

      <MobileCtaModal
        show={showCtaModal}
        handleClose={() => setShowCtaModal(false)}
        handleInstall={handleInstall}
        canInstall={canInstall}
      />

      <img
        onClick={() => navigate("/")}
        style={{ cursor: "pointer", width: "300px" }}
        src={logo}
        alt="OpenSecurityRoom"
      />
      <h1>Login</h1>

      <div className="login-methods-toggle">
        <button
          type="button"
          className={`btn ${!isPasswordless ? "btn-secondary" : "btn-outline-secondary"
            }`}
          onClick={() => setIsPasswordless(false)}
        >
          Com Senha
        </button>
        <button
          type="button"
          className={`btn ${isPasswordless ? "btn-secondary" : "btn-outline-secondary"
            }`}
          onClick={() => setIsPasswordless(true)}
        >
          Sem Senha
        </button>
      </div>

      {lockoutMessage && <p className="error-message">{lockoutMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {!isPasswordless ? (
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
              value={showPassword ? displayedPassword : password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (!showPassword) {
                  setDisplayedPassword("");
                  setRevealedIndices([]);
                  setHiddenIndices([]);
                } else {
                  setDisplayedPassword(e.target.value);
                }
              }}
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
                <BsFillDoorOpenFill size={20} />
                Accessing Room
              </>
            )}
          </button>

          <p className="text-white-50 mt-2 mb-1" style={{ fontSize: '0.9rem', fontWeight: '300' }}>
            ou continue com:
          </p>

          <div className="d-flex justify-content-center gap-3 div-btn-log">
            <button
              type="button"
              className="btn btn-outline-info rounded-circle d-flex justify-content-center align-items-center btn-social"
              onClick={handleGoogleLogin}
              disabled={isLoading || isLockedOut}
              style={{
                width: "55px",
                height: "55px",
                backgroundColor: 'transparent',
                color: '#FFF',
                borderWidth: '2px',
                fontSize: '1.5rem'
              }}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-info" />
              ) : (
                <BsGoogle size={28} />
              )}
            </button>

            <button
              type="button"
              className="btn btn-outline-info rounded-circle d-flex justify-content-center align-items-center btn-social"
              onClick={handleGithubLogin}
              disabled={isLoading || isLockedOut}
              style={{
                width: "55px",
                height: "55px",
                backgroundColor: 'transparent',
                color: '#FFF',
                borderWidth: '2px',
                fontSize: '1.5rem'
              }}
            >
              {isLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="text-info" />
              ) : (
                <AiFillGithub size={32} />
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={sendMagicLink}>
          <div className="input-icon-container">
            <div className="icon-background">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
            </div>
            <input
              type="email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
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
            disabled={isSendingLink || isLockedOut}
          >
            {isSendingLink ? (
              <div className="spinner-container">
                <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
              </div>
            ) : (
              "Enviar Link Mágico"
            )}
          </button>
        </form>
      )}

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