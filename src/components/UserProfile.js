// src/components/UserProfile.js
import React, { useEffect, useState } from "react";
import { auth, database } from "../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import { ref, onValue, update, remove } from "firebase/database";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Helmet } from "react-helmet";
import {
  faUser,
  faEnvelope,
  faPhone,
  faLock,
  faCheck,
  faTimes,
  faSpinner,
  faEdit, // Importação do ícone de edição
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { EmailAuthProvider } from "firebase/auth"; // Importação necessária
import iconPage from "./img/icon-menu.png";
import "./UserProfile.css";

const UserProfile = () => {
  const [userData, setUserData] = useState(undefined); // Inicializar como undefined
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Novo estado para edição
  const [editedCelular, setEditedCelular] = useState(""); // Estado para celular editado
  const [editedApelido, setEditedApelido] = useState(""); // Estado para apelido editado
  const navigate = useNavigate();

  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=6",
    "https://i.pravatar.cc/150?img=7",
    "https://i.pravatar.cc/150?img=8",
    "https://i.pravatar.cc/150?img=9",
    "https://i.pravatar.cc/150?img=10",
    "https://i.pravatar.cc/150?img=11",
    "https://i.pravatar.cc/150?img=12",
    "https://i.pravatar.cc/150?img=13",
    "https://i.pravatar.cc/150?img=14",
    "https://i.pravatar.cc/150?img=15",
    "https://i.pravatar.cc/150?img=16",
    "https://i.pravatar.cc/150?img=17",
    "https://i.pravatar.cc/150?img=18",
    "https://i.pravatar.cc/150?img=19",
    "https://i.pravatar.cc/150?img=20",
    "https://i.pravatar.cc/150?img=21",
    "https://i.pravatar.cc/150?img=22",
    "https://i.pravatar.cc/150?img=23",
    "https://i.pravatar.cc/150?img=24",
    "https://i.pravatar.cc/150?img=25",
    "https://i.pravatar.cc/150?img=26",
    "https://i.pravatar.cc/150?img=27",
    "https://i.pravatar.cc/150?img=28",
    "https://i.pravatar.cc/150?img=29",
    "https://i.pravatar.cc/150?img=30",
    "https://i.pravatar.cc/150?img=31",
    "https://i.pravatar.cc/150?img=32",
    "https://i.pravatar.cc/150?img=33",
    "https://i.pravatar.cc/150?img=34",
    "https://i.pravatar.cc/150?img=35",
    "https://i.pravatar.cc/150?img=36",
    "https://i.pravatar.cc/150?img=37",
    "https://i.pravatar.cc/150?img=38",
    "https://i.pravatar.cc/150?img=39",
    "https://i.pravatar.cc/150?img=40",
    "https://i.pravatar.cc/150?img=41",
    "https://i.pravatar.cc/150?img=42",
    "https://i.pravatar.cc/150?img=43",
    "https://i.pravatar.cc/150?img=44",
    "https://i.pravatar.cc/150?img=45",
    "https://i.pravatar.cc/150?img=46",
    "https://i.pravatar.cc/150?img=47",
    "https://i.pravatar.cc/150?img=48",
    "https://i.pravatar.cc/150?img=49",
    "https://i.pravatar.cc/150?img=50",
    "https://i.pravatar.cc/150?img=51",
    "https://i.pravatar.cc/150?img=52",
    "https://i.pravatar.cc/150?img=53",
    "https://i.pravatar.cc/150?img=54",
    "https://i.pravatar.cc/150?img=55",
    "https://i.pravatar.cc/150?img=56",
    "https://i.pravatar.cc/150?img=57",
    "https://i.pravatar.cc/150?img=58",
    "https://i.pravatar.cc/150?img=59",
    "https://i.pravatar.cc/150?img=60",
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
            avatar: "https://secure.gravatar.com/avatar/?d=mp",
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

  // Função para ativar o modo de edição
  const handleEditProfile = () => {
    if (userData) {
      setEditedCelular(userData.celular);
      setEditedApelido(userData.apelido);
      setIsEditing(true);
    }
  };

  // Função para salvar as alterações
  const handleSaveProfile = async () => {
    if (!editedCelular.trim() || !editedApelido.trim()) {
      Swal.fire(
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos antes de salvar.",
        "warning"
      );
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = auth.currentUser;
      const userRef = ref(database, `users/${currentUser.uid}`);

      await update(userRef, {
        celular: editedCelular,
        apelido: editedApelido,
      });

      Swal.fire("Sucesso", "Perfil atualizado com sucesso!", "success");
      setUserData((prevData) => ({
        ...prevData,
        celular: editedCelular,
        apelido: editedApelido,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Swal.fire(
        "Erro",
        "Erro ao atualizar o perfil. Tente novamente.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCelular("");
    setEditedApelido("");
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
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
      </Helmet>

      <header>
        <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
          <div className="container-fluid">
            <Link to="/create-room">
              <img
                className="navbar-brand img-fluid responsive-img"
                src={iconPage}
                alt="Bubble Safe Chat"
              />
            </Link>
          </div>
        </nav>
      </header>

      <motion.h1
        className="mb-4 text-center text-info mt-5"
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
              src={
                userData.avatar || "https://secure.gravatar.com/avatar/?d=mp"
              }
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

          {/* Nome Completo */}
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

          {/* Email */}
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

          {/* Celular */}
          <motion.h5
            className="card-title d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <FontAwesomeIcon icon={faPhone} className="me-2 text-info" />
            Celular
            {!isEditing && (
              <FontAwesomeIcon
                icon={faEdit}
                className="ms-2 text-secondary edit-icon"
                style={{ cursor: "pointer" }}
                onClick={handleEditProfile}
                title="Editar Perfil"
              />
            )}
          </motion.h5>
          <motion.div
            className="card-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                value={editedCelular}
                onChange={(e) => setEditedCelular(e.target.value)}
                placeholder="Digite seu celular"
              />
            ) : (
              userData.celular
            )}
          </motion.div>

          {/* Apelido */}
          <motion.h5
            className="card-title d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <FontAwesomeIcon icon={faLock} className="me-2 text-info" />
            Apelido
            {!isEditing && (
              <FontAwesomeIcon
                icon={faEdit}
                className="ms-2 text-secondary edit-icon"
                style={{ cursor: "pointer" }}
                onClick={handleEditProfile}
                title="Editar Perfil"
              />
            )}
          </motion.h5>
          <motion.div
            className="card-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                value={editedApelido}
                onChange={(e) => setEditedApelido(e.target.value)}
                placeholder="Digite seu apelido"
              />
            ) : (
              userData.apelido
            )}
          </motion.div>

          {/* Botões de Salvar e Cancelar no Modo de Edição */}
          {isEditing && (
            <div className="d-flex justify-content-end">
              <motion.button
                className="btn btn-success me-2"
                onClick={handleSaveProfile}
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
                    Salvar
                  </>
                )}
              </motion.button>
              <motion.button
                className="btn btn-secondary"
                onClick={handleCancelEdit}
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

      {/* Seção de Avatar */}
      <div className="mt-5">
        <h2 className="text-center text-info mb-4">Escolha um Avatar</h2>
        <div className="avatar-grid">
          {avatars.map((avatar, index) => (
            <motion.div
              key={index}
              className={`avatar-item ${
                selectedAvatar === avatar ? "selected" : ""
              }`}
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

      {/* Botão de Logout e Deletar Conta */}
      <div className="mt-5 d-flex justify-content-center">
        <motion.button
          className="btn btn-outline-danger me-3"
          onClick={deleteAccount}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faTimes} className="me-2" />
          Deletar Conta
        </motion.button>
        <motion.button
          className="btn btn-outline-secondary"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faLock} className="me-2" />
          Sair
        </motion.button>
      </div>
    </div>
  );
};

export default UserProfile;
