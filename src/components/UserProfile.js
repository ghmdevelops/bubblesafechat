// src/components/UserProfile.js
import React, { useEffect, useState } from "react";
import { auth, database } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { ref, onValue, update, remove } from "firebase/database";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faCheck,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { EmailAuthProvider } from "firebase/auth"; // Importação necessária
import "./UserProfile.css";

const UserProfile = () => {
  const [userData, setUserData] = useState(undefined); // Inicializar como undefined
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=6",
    "https://i.pravatar.cc/150?img=7",
    "https://i.pravatar.cc/150?img=8",
    "https://i.pravatar.cc/150?img=9",
    "https://i.pravatar.cc/150?img=10",
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      navigate("/");
      return;
    }

    const userRef = ref(database, `users/${currentUser.uid}`);
    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          // Definir um objeto vazio ou com valores padrão
          setUserData({
            firstName: "Nome Não Definido",
            email: currentUser.email,
            celular: "Número Não Definido",
            apelido: "Apelido Não Definido",
            avatar: "https://via.placeholder.com/100?text=User",
          });
        }
      },
      (error) => {
        console.error("Erro ao buscar dados do usuário:", error);
        Swal.fire("Erro", "Erro ao buscar dados do usuário.", "error");
        setUserData(null); // Definir como null em caso de erro
      }
    );

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      Swal.fire(
        "Seleção de Avatar",
        "Por favor, selecione um avatar antes de salvar.",
        "warning"
      );
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = auth.currentUser;
      const userRef = ref(database, `users/${currentUser.uid}`);

      await update(userRef, { avatar: selectedAvatar });

      Swal.fire("Sucesso", "Avatar atualizado com sucesso!", "success");
      setUserData((prevData) => ({
        ...prevData,
        avatar: selectedAvatar,
      }));
      setSelectedAvatar("");
    } catch (error) {
      console.error("Erro ao salvar avatar:", error);
      Swal.fire("Erro", "Erro ao salvar o avatar. Tente novamente.", "error");
    } finally {
      setIsSaving(false);
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

        const userRef = ref(database, `users/${currentUser.uid}`);
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

  // Adicionar condicional de carregamento
  if (userData === undefined) {
    return (
      <div className="container mt-5">
        <p className="text-center">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <Helmet>
        <title>Perfil do Usuário - Bubble Safe Chat</title>
      </Helmet>
      <motion.h1
        className="mb-4 text-center text-info"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Perfil do Usuário
      </motion.h1>
      <div className="card mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body">
          <div className="text-center mb-4">
            <img
              src={userData.avatar || "https://via.placeholder.com/100?text=User"}
              alt="User Avatar"
              className="rounded-circle"
              style={{
                width: "100px",
                height: "100px",
                border: "2px solid #17a2b8",
                boxShadow: "0 4px 8px rgba(23, 162, 184, 0.3)",
              }}
            />
          </div>

          <motion.h5
            className="card-title d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FontAwesomeIcon icon={faUser} className="me-2 text-info" />
            Nome Completo
          </motion.h5>
          <motion.p
            className="card-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {userData.firstName}
          </motion.p>

          <motion.h5
            className="card-title d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FontAwesomeIcon icon={faEnvelope} className="me-2 text-info" />
            Email
          </motion.h5>
          <motion.p
            className="card-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {userData.email}
          </motion.p>

          <motion.h5
            className="card-title d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <FontAwesomeIcon icon={faPhone} className="me-2 text-info" />
            Celular
          </motion.h5>
          <motion.p
            className="card-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {userData.celular}
          </motion.p>

          <motion.h5
            className="card-title d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <FontAwesomeIcon icon={faLock} className="me-2 text-info" />
            Apelido
          </motion.h5>
          <motion.p
            className="card-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {userData.apelido}
          </motion.p>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="text-center text-info mb-4">Escolha um Avatar</h2>
        <div className="avatar-grid">
          {avatars.map((avatar, index) => (
            <motion.div
              key={index}
              className={`avatar-item ${selectedAvatar === avatar ? "selected" : ""}`}
              onClick={() => handleAvatarSelect(avatar)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="img-fluid rounded-circle"
              />
            </motion.div>
          ))}
        </div>
        {selectedAvatar && (
          <div className="text-center mt-4">
            <motion.button
              className="btn btn-primary me-2"
              onClick={handleSaveAvatar}
              disabled={isSaving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSaving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="me-2" spin />
                  Salvando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Salvar Avatar
                </>
              )}
            </motion.button>
            <motion.button
              className="btn btn-danger"
              onClick={() => setSelectedAvatar("")}
              disabled={isSaving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Cancelar
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
