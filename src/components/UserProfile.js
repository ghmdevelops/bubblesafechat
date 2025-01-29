// src/components/UserProfile.js
import React, { useEffect, useState, useRef } from "react";
import { auth, database } from "../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import {
  ref,
  onValue,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
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
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { EmailAuthProvider } from "firebase/auth";
import iconPage from "./img/icon-menu.png";
import "./UserProfile.css";

const UserProfile = () => {
  const [userData, setUserData] = useState(undefined);
  const [userRooms, setUserRooms] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCelular, setEditedCelular] = useState("");
  const [editedApelido, setEditedApelido] = useState("");
  const navigate = useNavigate();
  const topRef = useRef(null);
  const saveAvatarRef = useRef(null);
  const [loading, setLoading] = useState(true);

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
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("Usuário não autenticado");
      setLoading(false);
      return;
    }

    const userRef = ref(database, `users/${currentUser.uid}`);
    const unsubscribeUser = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (!data.firstName && currentUser.displayName) {
            update(userRef, { firstName: currentUser.displayName });
            setUserData({ ...data, firstName: currentUser.displayName });
          } else {
            setUserData(data);
          }
        } else {
          const initialData = {
            firstName: currentUser.displayName || "Nome Não Definido",
            email: currentUser.email,
            celular: "Número Não Definido",
            apelido: "Apelido Não Definido",
            avatar: "https://secure.gravatar.com/avatar/?d=mp",
          };
          update(userRef, initialData);
          setUserData(initialData);
        }
      },
      (error) => {
        console.error("Erro ao buscar dados do usuário:", error);
        Swal.fire("Erro", "Erro ao buscar dados do usuário.", "error");
        setUserData(null);
      }
    );

    const roomsQuery = query(
      ref(database, "rooms"),
      orderByChild("creator"),
      equalTo(currentUser.uid)
    );

    const unsubscribe = onValue(
      roomsQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const rooms = [];
          snapshot.forEach((childSnapshot) => {
            rooms.push({ id: childSnapshot.key, ...childSnapshot.val() });
          });
          setUserRooms(rooms);
        } else {
          setUserRooms([]); // Sem salas encontradas
        }
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao buscar salas:", error);
        Swal.fire("Erro", "Erro ao buscar salas do usuário.", "error");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    if (saveAvatarRef.current) {
      saveAvatarRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const result = await Swal.fire({
      title: "Excluir Sala?",
      text: "Você tem certeza que deseja excluir esta sala? Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: false,
    });

    if (result.isConfirmed) {
      try {
        const roomRef = ref(database, `rooms/${roomId}`);
        await remove(roomRef);
        setUserRooms((prevRooms) =>
          prevRooms.filter((room) => room.id !== roomId)
        );
        Swal.fire("Excluído!", "A sala foi excluída com sucesso.", "success");
      } catch (error) {
        console.error("Erro ao excluir sala:", error);
        Swal.fire(
          "Erro",
          "Não foi possível excluir a sala. Tente novamente.",
          "error"
        );
      }
    }
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
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" });
      }
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

        // Remover usuário do nó 'users'
        const userRef = ref(database, `users/${currentUser.uid}`);
        await remove(userRef);

        // Remover todas as salas criadas pelo usuário
        for (const room of userRooms) {
          const roomRef = ref(database, `rooms/${room.id}`);
          await remove(roomRef);
        }

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

  const handleEditProfile = () => {
    if (userData) {
      setEditedCelular(userData.celular);
      setEditedApelido(userData.apelido);
      setIsEditing(true);
    }
  };

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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCelular("");
    setEditedApelido("");
  };

  if (userData === undefined) {
    return (
      <div className="container mt-5" ref={topRef}>
        <p className="text-center"></p>
      </div>
    );
  }

  return (
    <div className="container mt-5" ref={topRef}>
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
            transition={{ duration: 0.5, delay: 0.8 }}
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
            transition={{ duration: 0.5, delay: 0.9 }}
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

          <motion.h5
            className="card-title d-flex align-items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
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
            transition={{ duration: 0.5, delay: 1.1 }}
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
          <div className="text-center mt-4" ref={saveAvatarRef}>
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

      <div className="mt-5">
        <h2 className="text-center text-info mb-4">Salas Criadas por Você</h2>
        {userRooms.length === 0 ? (
          <p className="text-center">Você ainda não criou nenhuma sala.</p>
        ) : (
          <div className="list-group">
            {userRooms.map((room) => (
              <div
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                {room.name || `Sala ${room.id}`}
                <span className="badge bg-info text-white">
                  {room.participants
                    ? Object.keys(room.participants).length
                    : 0}{" "}
                  Participantes
                </span>
                <FontAwesomeIcon
                  icon={faTrash}
                  className="text-danger"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDeleteRoom(room.id)}
                  title="Excluir Sala"
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
