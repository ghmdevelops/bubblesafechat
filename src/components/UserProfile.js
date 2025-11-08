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
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=7",
    "https://i.pravatar.cc/150?img=9",
    "https://i.pravatar.cc/150?img=12",
    "https://i.pravatar.cc/150?img=15",
    "https://i.pravatar.cc/150?img=18",
    "https://i.pravatar.cc/150?img=21",
    "https://i.pravatar.cc/150?img=24",
    "https://i.pravatar.cc/150?img=27",
    "https://i.pravatar.cc/150?img=30",
    "https://i.pravatar.cc/150?img=33",
    "https://i.pravatar.cc/150?img=36",
    "https://i.pravatar.cc/150?img=39",
    "https://i.pravatar.cc/150?img=42",
    "https://i.pravatar.cc/150?img=45",
    "https://i.pravatar.cc/150?img=48",
    "https://i.pravatar.cc/150?img=51",
    "https://i.pravatar.cc/150?img=54",
    "https://i.pravatar.cc/150?img=57",
    "https://i.pravatar.cc/150?img=60",

    "https://robohash.org/random-robot-a.png?size=150x150&set=set1",
    "https://robohash.org/random-robot-b.png?size=150x150&set=set1",
    "https://robohash.org/monster-avatar-a.png?size=150x150&set=set2",
    "https://robohash.org/monster-avatar-b.png?size=150x150&set=set2",
    "https://robohash.org/head-robot-a.png?size=150x150&set=set3",
    "https://robohash.org/head-robot-b.png?size=150x150&set=set3",
    "https://robohash.org/cat-avatar-a.png?size=150x150&set=set4",
    "https://robohash.org/cat-avatar-b.png?size=150x150&set=set4",

    "https://api.dicebear.com/8.x/pixel-art/svg?seed=Programmer",
    "https://api.dicebear.com/8.x/pixel-art/svg?seed=Artist",
    "https://api.dicebear.com/8.x/pixel-art/svg?seed=Gamer",
    "https://api.dicebear.com/8.x/pixel-art/svg?seed=Coder",

    "https://api.dicebear.com/8.x/initials/svg?seed=AB&backgroundColor=00BCD4,FF9800",
    "https://api.dicebear.com/8.x/initials/svg?seed=MZ&backgroundColor=8BC34A,E91E63",
    "https://api.dicebear.com/8.x/initials/svg?seed=CD&backgroundColor=9C27B0,009688",
    "https://api.dicebear.com/8.x/initials/svg?seed=XY&backgroundColor=FFC107,3F51B5",


    "https://api.dicebear.com/8.x/adventurer/svg?seed=Elf&eyes=variant01",
    "https://api.dicebear.com/8.x/adventurer/svg?seed=Dwarf&mouth=variant01",

    "https://api.dicebear.com/8.x/rings/svg?seed=Abstract1",
    "https://api.dicebear.com/8.x/rings/svg?seed=Abstract2",
    "https://api.dicebear.com/8.x/rings/svg?seed=Abstract3",
    "https://api.dicebear.com/8.x/rings/svg?seed=Abstract4",

    "https://api.dicebear.com/8.x/lorelei/svg?seed=Girl1",
    "https://api.dicebear.com/8.x/lorelei/svg?seed=Girl2",
    "https://api.dicebear.com/8.x/lorelei/svg?seed=Woman1",
    "https://api.dicebear.com/8.x/lorelei/svg?seed=Woman2",

    "https://api.dicebear.com/8.x/fun-emoji/svg?seed=Happy",
    "https://api.dicebear.com/8.x/fun-emoji/svg?seed=Curious",
    "https://api.dicebear.com/8.x/fun-emoji/svg?seed=Angry",
    "https://api.dicebear.com/8.x/fun-emoji/svg?seed=Sleepy",
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

  const handleToggleAvatarSelector = () => {
    if (isEditing) {
      handleCancelEdit();
    }
    setShowAvatarSelector(prev => !prev);
  };

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

      <div className="profile-container mx-auto p-4" style={{
        maxWidth: "500px",
        backgroundColor: '#1E2328',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
        color: '#E9EDEF'
      }}>
        {/* --- Seção do Avatar --- */}
        <div className="text-center mb-5">
          <motion.div
            onClick={handleToggleAvatarSelector}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            style={{
              cursor: 'pointer',
              display: 'inline-block',
              position: 'relative'
            }}
            title="Clique para mudar o Avatar"
          >
            <img
              src={
                userData.avatar || "https://secure.gravatar.com/avatar/?d=mp"
              }
              alt="User Avatar"
              className="rounded-circle"
              style={{
                width: "120px",
                height: "120px",
                border: "4px solid #02ffc8ff",
                boxShadow: "0 0 15px rgba(2, 255, 200, 0.4)",
                objectFit: 'cover'
              }}
            />
            {/* Ícone de edição flutuante para indicar interatividade */}
            <div
              style={{
                position: 'absolute',
                bottom: 5,
                right: 5,
                backgroundColor: '#02ffc8ff',
                borderRadius: '50%',
                padding: '6px',
                lineHeight: '1',
                boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)'
              }}
            >
              <FontAwesomeIcon icon={faCamera} style={{ color: '#1E2328', fontSize: '14px' }} />
            </div>
          </motion.div>
        </div>

        {/* --- Seletor de Avatar (Toggle) --- */}
        <AnimatePresence>
          {showAvatarSelector && (
            <motion.div
              className="mt-5 mb-5 p-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: '#2C3136', borderRadius: '8px' }}
            >
              <h4 className="text-center" style={{ color: '#02ffc8ff', marginBottom: '15px' }}>Escolha um Avatar</h4>
              <div
                className="avatar-grid d-flex flex-wrap justify-content-center" // Mantemos o flex-wrap para permitir múltiplas linhas
                style={{
                  gap: '10px',
                  maxHeight: '220px', // Define a altura máxima para mostrar cerca de 3 linhas (60px * 3 + padding/gap)
                  overflowY: 'auto',   // Habilita a rolagem vertical
                  overflowX: 'hidden', // Esconde a rolagem horizontal
                  padding: '10px 5px', // Adiciona padding interno para melhor visualização
                  backgroundColor: '#1E2328', // Fundo sutil para o scroll
                  borderRadius: '6px'
                }}
              >
                {avatars.map((avatar, index) => (
                  <motion.div
                    key={index}
                    className={`avatar-item`}
                    onClick={() => handleAvatarSelect(avatar)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: selectedAvatar === avatar ? '3px solid #02ffc8ff' : '1px solid #495057',
                      transition: 'border 0.2s',
                      // Removemos flexShrink: 0, pois o flex-wrap já lida com o layout
                    }}
                  >
                    <img
                      src={avatar}
                      alt={`Avatar ${index + 1}`}
                      className="img-fluid"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </motion.div>
                ))}
              </div>

              {selectedAvatar && (
                <div className="text-center mt-4" ref={saveAvatarRef}>
                  <motion.button
                    className="btn me-3"
                    onClick={handleSaveAvatar}
                    disabled={isSaving}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: '#02ffc8ff',
                      borderColor: '#02ffc8ff',
                      color: '#1E2328',
                      fontWeight: 'bold'
                    }}
                  >
                    {isSaving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="me-2" spin />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} className="me-2" />
                        Salvar Novo Avatar
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    className="btn btn-secondary"
                    onClick={handleToggleAvatarSelector} // Ação de cancelar fecha o seletor
                    disabled={isSaving}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      backgroundColor: '#495057',
                      borderColor: '#495057'
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Fechar
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Campo: Nome Completo --- */}
        <motion.div
          className="mb-4 pb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ borderBottom: '1px solid #3A414A' }}
        >
          <h6 className="text-uppercase mb-1" style={{ fontSize: '0.8rem', color: '#A9B0B7' }}>
            <FontAwesomeIcon icon={faUser} className="me-2 text-info" />
            Nome Completo
          </h6>
          <p className="lead fw-bold" style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
            {userData.firstName}
          </p>
        </motion.div>

        {/* --- Campo: Email --- */}
        <motion.div
          className="mb-4 pb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ borderBottom: '1px solid #3A414A' }}
        >
          <h6 className="text-uppercase mb-1" style={{ fontSize: '0.8rem', color: '#A9B0B7' }}>
            <FontAwesomeIcon icon={faEnvelope} className="me-2 text-info" />
            Email
          </h6>
          <p className="lead fw-bold" style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
            {userData.email}
          </p>
        </motion.div>

        {/* --- Campo: Celular (Editável) --- */}
        <motion.div
          className="mb-4 pb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={{ borderBottom: '1px solid #3A414A' }}
        >
          <h6 className="text-uppercase d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.8rem', color: '#A9B0B7' }}>
            <span>
              <FontAwesomeIcon icon={faPhone} className="me-2 text-info" />
              Celular
            </span>
            {!isEditing && (
              <FontAwesomeIcon
                icon={faEdit}
                className="edit-icon p-1 rounded-circle"
                style={{
                  cursor: "pointer",
                  color: "#02ffc8ff",
                  backgroundColor: 'rgba(2, 255, 200, 0.1)'
                }}
                onClick={handleEditProfile}
                title="Editar Celular e Apelido"
              />
            )}
          </h6>
          <div className="mt-2">
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                style={{
                  backgroundColor: '#2C3136',
                  color: '#FFFFFF',
                  border: '1px solid #02ffc8ff'
                }}
                value={editedCelular}
                onChange={(e) => setEditedCelular(e.target.value)}
                placeholder="Digite seu celular"
              />
            ) : (
              <p className="lead fw-bold" style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
                {userData.celular || 'Não fornecido'}
              </p>
            )}
          </div>
        </motion.div>

        {/* --- Campo: Apelido (Editável) --- */}
        <motion.div
          className="mb-5 pb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h6 className="text-uppercase mb-1" style={{ fontSize: '0.8rem', color: '#A9B0B7' }}>
            <FontAwesomeIcon icon={faLock} className="me-2 text-info" />
            Apelido
          </h6>
          <div className="mt-2">
            {isEditing ? (
              <input
                type="text"
                className="form-control"
                style={{
                  backgroundColor: '#2C3136',
                  color: '#FFFFFF',
                  border: '1px solid #02ffc8ff'
                }}
                value={editedApelido}
                onChange={(e) => setEditedApelido(e.target.value)}
                placeholder="Digite seu apelido"
              />
            ) : (
              <p className="lead fw-bold" style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>
                {userData.apelido}
              </p>
            )}
          </div>
        </motion.div>

        {/* --- Botões de Ação do Perfil (Salvar/Cancelar) --- */}
        {isEditing && (
          <div className="d-flex justify-content-end pt-3" style={{ borderTop: '1px solid #3A414A' }}>
            <motion.button
              className="btn me-3"
              onClick={handleSaveProfile}
              disabled={isSaving}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: '#02ffc8ff',
                borderColor: '#02ffc8ff',
                color: '#1E2328',
                fontWeight: 'bold'
              }}
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
              style={{
                backgroundColor: '#495057',
                borderColor: '#495057'
              }}
            >
              <FontAwesomeIcon icon={faTimes} className="me-2" />
              Cancelar
            </motion.button>
          </div>
        )}
      </div>

      <div className="mt-5">
        <h2 className="text-center mb-4" style={{ color: '#17a2b8' }}>
          Salas Criadas por Você
        </h2>

        {userRooms.length === 0 ? (
          <div className="text-center p-4" style={{
            backgroundColor: '#2C3136',
            borderRadius: '8px',
            color: '#A9B0B7'
          }}>
            <p className="mb-0">Você ainda não criou nenhuma sala. Comece agora!</p>
          </div>
        ) : (
          <div className="d-grid gap-3">
            {userRooms.map((room, index) => (
              <motion.div
                key={room.id}
                className="p-3 d-flex align-items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(2, 255, 200, 0.2)' }}
                style={{
                  backgroundColor: '#2C3136', // Fundo sutil do card
                  borderRadius: '8px',
                  borderLeft: '4px solid #02ffc8ff', // Destaque na lateral
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                  color: '#E9EDEF',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* --- 1. Nome da Sala (Expansível) --- */}
                <div className="flex-grow-1">
                  <h5 className="mb-0 fw-bold" style={{ color: '#FFFFFF' }}>
                    {room.name || `Sala ${room.id}`}
                  </h5>
                </div>

                {/* --- 2. Participantes (Badge Moderno) --- */}
                <div
                  className="d-flex align-items-center me-4"
                  title="Número de participantes"
                  style={{ color: '#A9B0B7' }}
                >
                  <span style={{
                    backgroundColor: 'rgba(2, 255, 200, 0.2)', // Fundo transparente ciano
                    color: '#02ffc8ff', // Texto ciano
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {/* Ícone de Pessoas (se você tiver o faUsers) */}
                    {/* <FontAwesomeIcon icon={faUsers} className="me-2" /> */}
                    {Object.keys(room.participants || {}).length} Participantes
                  </span>
                </div>

                {/* --- 3. Botão de Excluir (Destaque e Segurança) --- */}
                <motion.div
                  className="p-2 rounded-circle"
                  whileHover={{ scale: 1.15, backgroundColor: 'rgba(220, 53, 69, 0.15)' }} // Destaque vermelho sutil no hover
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteRoom(room.id)}
                  title="Excluir Sala"
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-danger" // Mantemos o ícone vermelho para indicar perigo
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 d-flex justify-content-center mb-3">
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
