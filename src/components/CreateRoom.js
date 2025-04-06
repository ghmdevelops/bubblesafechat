// src/components/CreateRoom.js
import React, { useState, useEffect, useRef } from "react";
import { auth, database } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import "@sweetalert2/theme-dark/dark.css";
import "./CreateRoom.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUserShield,
  faShieldAlt,
  faEye,
  faSpinner,
  faTimes,
  faCheck,
  faPowerOff,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import iconPage from "./img/icon-menu.png";
import { EmailAuthProvider, getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  ref as dbRef,
  push,
  onValue,
  remove,
  update,
  set,
  get,
} from "firebase/database";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState("");
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userApelido, setUserApelido] = useState("");
  const LOGOUT_TIMEOUT = 60 * 60 * 1000;
  let logoutTimer;

  useEffect(() => {
    setUserName(userApelido);
  }, [userApelido]);

  useEffect(() => {
    const showProtectionMessage = () => {
      const lastShown = localStorage.getItem("lastProtectionMessageShown");
      const now = new Date();

      if (!lastShown || now - new Date(lastShown) > 3 * 24 * 60 * 60 * 1000) {
        Swal.fire({
          title: "🔒 Proteção Máxima e Controle Total!",
          html: `<p style="text-align: left; font-size: 1em; color: #ffffff; line-height: 1.5;">
                    Bem-vindo à <strong>Bubble Safe Chat</strong>, sua plataforma com o mais alto nível de <strong>privacidade</strong> e <strong>segurança</strong>. Todas as salas são protegidas por <strong>criptografia de ponta</strong>, garantindo que você permaneça completamente anônimo e no controle.
                  </p>
                  <p style="text-align: left; font-size: 1em; color: #ffffff; line-height: 1.5;">
                    Seus dados pessoais são armazenados por no máximo <strong>24 horas</strong> e podem ser excluídos permanentemente a qualquer momento. Após esse período, realizamos um <strong>reset diário</strong> para garantir que nenhuma informação permaneça armazenada.
                  </p>
                  <p style="text-align: left; font-size: 1em; color: #ffffff; line-height: 1.5;">
                    Você pode compartilhar suas salas com total segurança por meio de <strong>QR Code</strong> ou link, sempre mantendo o controle total sobre quem acessa. Aqui, você está no comando.
                  </p>`,
          icon: "info",
          confirmButtonText: "Entendido!",
          customClass: {
            popup: "swal-popup-dark",
          },
          background: "#0C090A",
          width: "800px",
          backdrop: `rgba(0, 0, 0, 0.7)`,
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        }).then(() => {
          localStorage.setItem("lastProtectionMessageShown", now);
        });
      }
    };

    showProtectionMessage();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const emailName = user.email.split("@")[0];
        setUserEmail(emailName);
        setDisplayName(user.displayName || "");

        const userRef = dbRef(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserAvatar(
              userData.avatar || "https://secure.gravatar.com/avatar/?d=mp"
            );
            setUserApelido(userData.apelido || "Usuário");

            // Verifica se o avatar está definido
            if (!userData.avatar) {
              Swal.fire({
                title: "Escolha um Avatar!",
                text: "Você ainda não escolheu um avatar. Deseja fazer isso agora?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                background: "#1E1E1E",
                customClass: {
                  popup: "swal-popup-dark",
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  navigate("/user-profile");
                }
              });
            }

            // Verifica se o apelido está definido
            if (
              userData.apelido === "Apelido Não Definido" ||
              userData.apelido === "Usuário"
            ) {
              Swal.fire({
                title: "Defina um Apelido e Avatar!",
                text: "Você ainda não definiu um apelido. Deseja fazer isso agora?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sim",
                cancelButtonText: "Não",
                background: "#1E1E1E",
                customClass: {
                  popup: "swal-popup-dark",
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  navigate("/user-profile");
                }
              });
            }
          } else {
            setUserAvatar("https://secure.gravatar.com/avatar/?d=mp");
            setUserApelido("Usuário");
            Swal.fire({
              title: "Escolha um Avatar!",
              text: "Você ainda não escolheu um avatar. Deseja fazer isso agora?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Sim",
              cancelButtonText: "Não",
              background: "#1E1E1E",
              customClass: {
                popup: "swal-popup-dark",
              },
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/user-profile");
              }
            });
            Swal.fire({
              title: "Defina um Apelido!",
              text: "Você ainda não definiu um apelido. Deseja fazer isso agora?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Sim",
              cancelButtonText: "Não",
              background: "#1E1E1E",
              customClass: {
                popup: "swal-popup-dark",
              },
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/user-profile");
              }
            });
          }
        });
        resetLastAccessTime();
      } else {
        navigate("/");
      }
    });

    const events = ["mousemove", "keydown", "click"];
    events.forEach((event) => {
      window.addEventListener(event, resetLastAccessTime);
    });

    startLogoutTimer();

    return () => {
      unsubscribe();
      events.forEach((event) => {
        window.removeEventListener(event, resetLastAccessTime);
      });
      clearTimeout(logoutTimer);
    };
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const resetLastAccessTime = () => {
    localStorage.setItem("lastAccessTime", Date.now());
    startLogoutTimer();
  };

  const reauthenticateUser = async () => {
    const currentUser = auth.currentUser;
    try {
      const { value: password } = await Swal.fire({
        title: "Reautenticação necessária",
        input: "password",
        inputLabel: "Digite sua senha para confirmar:",
        inputPlaceholder: "Senha",
        inputAttributes: {
          autocapitalize: "off",
          autocorrect: "off",
          id: "password-input",
        },
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        didOpen: () => {
          const passwordInput = Swal.getInput();
          const container = Swal.getHtmlContainer();
          const inputLabel = document.querySelector(".swal2-input-label");
          if (inputLabel) {
            inputLabel.style.color = "#fff";
          }

          const checkboxLabel = document.createElement("label");
          checkboxLabel.setAttribute("for", "show-password");
          checkboxLabel.innerHTML = "Mostrar senha";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "ms-2";
          checkbox.id = "show-password";

          checkboxLabel.appendChild(checkbox);
          container.appendChild(checkboxLabel);

          checkbox.addEventListener("change", (event) => {
            if (event.target.checked) {
              passwordInput.type = "text";
            } else {
              passwordInput.type = "password";
            }
          });
        },
      });

      if (!password) {
        return false;
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await currentUser.reauthenticateWithCredential(credential);
      return true;
    } catch (error) {
      Swal.fire(
        "Erro de autenticação",
        "Reautenticação falhou, tente novamente.",
        "error"
      );
      return false;
    }
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser.emailVerified) {
      Swal.fire({
        title: "Verifique seu e-mail",
        text: "Você precisa verificar o seu e-mail antes de excluir a conta. Um e-mail de verificação foi enviado.",
        icon: "warning",
        confirmButtonText: "Ok",
      });

      try {
        await currentUser.sendEmailVerification();
        Swal.fire(
          "E-mail enviado",
          "Por favor, verifique seu e-mail e tente novamente.",
          "info"
        );
      } catch (error) {
        Swal.fire("Erro ao enviar e-mail", error.message, "error");
      }
      return;
    }

    const result = await Swal.fire({
      title: "Excluir conta?",
      text: "Tem certeza que deseja excluir sua conta e todos os seus dados?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const reauthenticated = await reauthenticateUser();
        if (!reauthenticated) return;
        const userRef = dbRef(database, `users/${currentUser.uid}`);
        await remove(userRef);
        await currentUser.delete();
        Swal.fire("Conta excluída com sucesso!", "", "success");
        navigate("/");
      } catch (error) {
        console.error("Erro ao excluir a conta:", error);
        Swal.fire("Erro ao excluir a conta", error.message, "error");
      }
    }
  };

  const startLogoutTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      handleLogout();
    }, LOGOUT_TIMEOUT);
  };

  const generateEncryptionKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
  };

  const createRoom = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      setLoading(true);
      const encryptionKey = generateEncryptionKey();
      sessionStorage.setItem("encryptionKey", encryptionKey);
      localStorage.setItem("userName", userName);

      try {
        const roomsRef = dbRef(database, "rooms");
        const newRoomRef = push(roomsRef);

        // Recupera os dados do usuário diretamente do Firebase
        const userRef = dbRef(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        let avatar = "https://secure.gravatar.com/avatar/?d=mp";
        if (snapshot.exists()) {
          const userData = snapshot.val();
          avatar = userData.avatar || avatar;
        }

        await set(newRoomRef, {
          name: roomName,
          createdAt: new Date().toISOString(),
          creator: currentUser.uid,
          creatorName: userName,
          encryptionKey: encryptionKey,
          avatar: avatar,
        });

        setSuccessMessage("Sala criada com sucesso!");
        setErrorMessage("");
        navigate(`/door/${newRoomRef.key}`);
      } catch (error) {
        console.error("Erro ao criar sala:", error);
        setErrorMessage("Erro ao criar a sala. Tente novamente.");
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Usuário não autenticado!");
      navigate("/login");
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Tem certeza?",
      text: "Você tem certeza que deseja sair?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, sair!",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        auth
          .signOut()
          .then(() => {
            localStorage.removeItem("lastAccessTime");
            navigate("/");
          })
          .catch((error) => {
            console.error("Erro ao deslogar:", error.message);
            Swal.fire(
              "Erro!",
              "Erro ao deslogar. Tente novamente mais tarde.",
              "error"
            );
          });
      }
    });
  };

  const handleConfirmName = () => {
    if (userName.trim()) {
      setIsNameConfirmed(true);
    } else {
      Swal.fire({
        icon: "error",
        title: "Nick inválido",
        text: "Por favor, insira um nome de nick válido.",
        confirmButtonText: "Ok",
      });
    }
  };

  const handleCancelName = () => {
    setIsNameConfirmed(false);
    setUserName("");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Bubble Safe Chat - Rooms</title>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
        User-agent: * Allow: /
      </Helmet>

      <header>
        <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
          <div className="container-fluid">
            <img
              className="navbar-brand img-fluid responsive-img img-u53"
              src={iconPage}
              alt="OpenSecurityRoom"
            />

            <ul className="navbar-nav ms-auto mb-2 mb-md-0">
              <li className="nav-item me-3 position-relative" ref={dropdownRef}>
                <motion.div
                  onClick={toggleDropdown}
                  className="position-relative"
                >
                  <motion.img
                    src={userAvatar}
                    alt="User Avatar"
                    className="user-avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      border: "2px solid #17a2b8",
                      boxShadow: "0 4px 8px rgba(23, 162, 184, 0.3)",
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="dropdown-menu show position-absolute mt-2 p-2 bg-dark rounded shadow"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          left: "-150px",
                          top: "100%",
                          zIndex: 1050,
                          minWidth: "200px",
                        }}
                      >
                        <motion.button
                          className="dropdown-item text-white"
                          onClick={() => {
                            navigate("/user-profile");
                            setIsDropdownOpen(false);
                          }}
                          whileHover={{ backgroundColor: "#17a2b8" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FontAwesomeIcon
                            icon={faUserCircle}
                            className="me-2"
                          />
                          Ver Perfil
                        </motion.button>
                        <motion.button
                          className="dropdown-item text-white"
                          onClick={() => {
                            deleteAccount();
                            setIsDropdownOpen(false);
                          }}
                          whileHover={{ backgroundColor: "#dc3545" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FontAwesomeIcon icon={faTimes} className="me-2" />
                          Excluir Conta
                        </motion.button>
                        <motion.button
                          className="dropdown-item text-white"
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          whileHover={{ backgroundColor: "#17a2b8" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FontAwesomeIcon icon={faPowerOff} className="me-2" />
                          Sair
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      <div className="container">
        <div className="container-32" style={{ paddingTop: "80px" }}>
          {!isNameConfirmed && (
            <div className="welcome-section">
              <h2 className="fw-bold text-info mb-4">
                Seja bem-vindo, {userApelido}!
              </h2>
              <h1 className="fw-bold text-light mb-4">
                Escolha um apelido que reflita sua personalidade
              </h1>

              <ul className="benefits-list text-light">
                <li className="mb-3">
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="me-2 text-info"
                  />
                  Privacidade Garantida: suas conversas são protegidas por
                  segurança de ponta a ponta.
                </li>
                <li className="mb-3">
                  <FontAwesomeIcon icon={faEye} className="me-2 text-info" />
                  Transparência Total: controle completo sobre suas informações
                  e permissões.
                </li>
                <li className="mb-3">
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="me-2 text-info"
                  />
                  Controle Personalizado: você decide quem participa e gerencia
                  sua sala com total autonomia.
                </li>
                <li className="mb-3">
                  <FontAwesomeIcon icon={faLock} className="me-2 text-info" />
                  Segurança Avançada: suas informações nunca são compartilhadas
                  ou armazenadas sem sua permissão.
                </li>
              </ul>
            </div>
          )}
        </div>

        {!isNameConfirmed ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <label>
              <motion.span
                className="ms-1 mb-2"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  color: "#F5F5F5",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                Escolha um nome criativo para sua jornada
              </motion.span>

              <div className="input-group mb-1">
                <motion.input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserApelido(e.target.value);
                    setUserName(e.target.value);
                  }}
                  placeholder="Ex: CyberNovaX"
                  className="form-control"
                  style={{
                    border: "2px solid #17a2b8",
                    borderRadius: "8px",
                    padding: "10px 10px",
                    fontSize: "15px",
                    background: "#f8f9fa",
                    color: "#212529",
                    boxShadow: "0 4px 8px rgba(23, 162, 184, 0.2)",
                  }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />

                {userName.trim() && (
                  <motion.button
                    className="btn btn-info w-100 w-md-auto"
                    onClick={handleConfirmName}
                    disabled={!userName.trim() || loading}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "12px 14px",
                      fontWeight: "bold",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      marginLeft: "1px",
                      background:
                        "linear-gradient(90deg,rgb(23, 117, 184), #138496)",
                      boxShadow: "0 4px 10px rgba(23, 162, 184, 0.4)",
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                    Pronto
                  </motion.button>
                )}
              </div>
            </label>
          </motion.div>
        ) : (
          <>
            <div>
              <motion.h1
                className="fw-bold text-info mb-4"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                Criar uma Sala Segura
              </motion.h1>

              <motion.ul
                className="benefits-list text-light mt-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              >
                <motion.li
                  className="mb-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                  <FontAwesomeIcon icon={faLock} className="me-2 text-info" />
                  Privacidade Absoluta: Nós não armazenamos ou compartilhamos
                  seus dados pessoais. Você mantém controle total sobre suas
                  informações.
                </motion.li>

                <motion.li
                  className="mb-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                >
                  <FontAwesomeIcon
                    icon={faUserShield}
                    className="me-2 text-info"
                  />
                  Gerenciamento Personalizado: Escolha quem pode entrar na sala
                  e gerencie permissões de acesso facilmente.
                </motion.li>

                <motion.li
                  className="mb-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                >
                  <FontAwesomeIcon
                    icon={faShieldAlt}
                    className="me-2 text-info"
                  />
                  Proteção Completa: Suas conversas são protegidas por
                  criptografia avançada, garantindo sua segurança em todas as
                  interações.
                </motion.li>

                <motion.li
                  className="mb-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                >
                  <FontAwesomeIcon icon={faEye} className="me-2 text-info" />
                  Transparência Total: Nenhum dado é armazenado permanentemente.
                  Controles de segurança automáticos garantem sua privacidade.
                </motion.li>
              </motion.ul>

              <label>
                <motion.span
                  className="ms-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  style={{
                    color: "#F5F5F5",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  Nomeie sua sala de forma única e criativa
                </motion.span>

                <div className="input-group mb-1">
                  <motion.input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Ex: CyberLounge"
                    className="form-control mb-1"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    style={{
                      border: "2px solid #17a2b8",
                      borderRadius: "8px",
                      padding: "10px 10px",
                      fontSize: "1rem",
                      background: "#f8f9fa",
                      color: "#212529",
                      boxShadow: "0 4px 8px rgba(23, 162, 184, 0.2)",
                      transition:
                        "box-shadow 0.3s ease, border-color 0.3s ease",
                      outline: "none",
                    }}
                    whileFocus={{
                      boxShadow: "0 4px 12px rgba(23, 162, 184, 0.4)",
                      borderColor: "#007bff",
                    }}
                  />

                  {roomName.trim() && (
                    <>
                      <motion.button
                        className="btn btn-info w-100 w-md-auto"
                        onClick={createRoom}
                        disabled={!roomName.trim() || loading}
                        whileHover={{ scale: 1.07 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: "12px 14px",
                          fontWeight: "bold",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          marginLeft: "1px",
                          background:
                            "linear-gradient(90deg,rgb(23, 117, 184), #138496)",
                          boxShadow: "0 4px 10px rgba(23, 162, 184, 0.4)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.2 }}
                      >
                        {loading ? (
                          <>
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="me-2"
                              spin
                            />
                            Criando...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="me-2" />
                            Confirmar
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        className="btn btn-danger w-100 w-md-auto cancroom"
                        onClick={handleCancelName}
                        whileHover={{ scale: 1.07 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: "12px 14px",
                          fontWeight: "bold",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(90deg,rgb(203, 81, 81), rgb(184, 23, 23))",
                          boxShadow: "0 4px 10px rgba(23, 162, 184, 0.4)",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Cancelar
                      </motion.button>
                    </>
                  )}
                </div>
              </label>
            </div>
          </>
        )}

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default CreateRoom;
