// src/components/Navbar.js
import React, { useState, useEffect, useRef } from "react";
import { auth, database } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faPowerOff,
  faUserCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import iconPage from "./img/icon-menu.png";
import { motion, AnimatePresence } from "framer-motion";
import { ref as dbRef, onValue, remove } from "firebase/database";
import { EmailAuthProvider } from "firebase/auth";

const Navbar = () => {
  const [userAvatar, setUserAvatar] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = dbRef(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserAvatar(
              snapshot.val().avatar || "https://via.placeholder.com/40?text=Avatar"
            );
          } else {
            setUserAvatar("https://via.placeholder.com/40?text=Avatar");
          }
        });
      } else {
        setUserAvatar("");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
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
          checkbox.className = "d-none";
          checkbox.id = "show-password";
          checkbox.style.marginLeft = "10px";

          container.appendChild(checkboxLabel);
          container.appendChild(checkbox);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
      <div className="container-fluid">
        <img
          className="navbar-brand img-fluid responsive-img"
          src={iconPage}
          alt="OpenSecurityRoom"
        />
        <button
          className="navbar-toggler bg-black"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
          aria-controls="navbarCollapse"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <ul className="navbar-nav ms-auto mb-2 mb-md-0">
            <li className="nav-item me-3 position-relative" ref={dropdownRef}>
              <motion.div onClick={toggleDropdown} className="position-relative">
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
                          handleLogout();
                          setIsDropdownOpen(false);
                        }}
                        whileHover={{ backgroundColor: "#17a2b8" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FontAwesomeIcon
                          icon={faPowerOff}
                          className="me-2"
                        />
                        Sair
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
