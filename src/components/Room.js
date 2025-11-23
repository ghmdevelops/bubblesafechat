import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { database, auth, storage } from "../firebaseConfig";
import { QRCodeCanvas } from "qrcode.react";
import "./Room.css";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import Swal from "sweetalert2";
import "@sweetalert2/theme-dark/dark.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { faSmile as faSmileRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faEllipsis,
  faPlus,
  faUserSecret,
  faBell,
  faLock,
  faPen,
  faUserSlash,
  faPauseCircle,
  faDoorOpen,
  faArrowRight,
  faUser,
  faClock,
  faSignOutAlt,
  faUserCircle,
  faPaperPlane,
  faMicrophone,
  faCheckCircle,
  faEllipsisV,
  faTrashAlt,
  faPlayCircle,
  faClipboard,
  faQrcode,
  faShareAlt,
  faTrash,
  faCheck,         // <--- MANTENHA AQUI
  faTimes,
  faThumbsUp,
  faHeart,
  faLaugh,
  faSurprise,
  faSadTear,
  faAngry,
  faPaperclip,
  faImage,
  faMicrophoneAlt,
  faEllipsisH,
  faChevronRight,
  faXmark,
  faExclamationTriangle,
  faReply,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faTelegram } from "@fortawesome/free-brands-svg-icons";
import { Helmet } from "react-helmet";
import iconPage from "./img/icon-menu.png";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "react-bootstrap";
import notificationSound from "./sounds/notification.mp3";
import Joyride from "react-joyride";
import { ref as dbRef, onValue } from "firebase/database";
import CryptoJS from "crypto-js";

const Room = () => {
  const { roomId } = useParams();
  const [userName, setUserName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [isRoomLoaded, setIsRoomLoaded] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [hasRequestedAccess, setHasRequestedAccess] = useState(false);
  const [destructionTime, setDestructionTime] = useState(10);
  const [isDestructionActive, setIsDestructionActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [shareMethod, setShareMethod] = useState("");
  const [expelledUsers, setExpelledUsers] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const [usersWithExpelButton, setUsersWithExpelButton] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [creatorAvatar, setCreatorAvatar] = useState(null);
  const [recognitionActive, setRecognitionActive] = useState(false);
  const recognitionRef = useRef(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showPlusButton, setShowPlusButton] = useState(false);
  const [showExpelModal, setShowExpelModal] = useState(false);
  const toggleExpelModal = () => setShowExpelModal(!showExpelModal);
  const [isReloading, setIsReloading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const previousMessageCount = useRef(0);
  const [roomPassword, setRoomPassword] = useState("");
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isRotated, setIsRotated] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [messageIdWithOpenReactions, setMessageIdWithOpenReactions] = useState(null);
  const ENCRYPTION_KEY = "chaveSuperSecretaNoCliente";

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleOptions = () => {
    setShowOptions(prev => !prev);
  };


  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});

  function encryptMessage(plainText) {
    return CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
  }

  function decryptMessage(cipherText) {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");

  const messageContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const shareLink = `${window.location.origin}/bubblesafechat/#/room/${roomId}`;
  const shareLink2 = `${window.location.origin}/#/room/${roomId}`;

  const sendMessageWithPassword = (password) => {
    if (message.trim()) {
      const messageRef = database.ref(`rooms/${roomId}/messages`).push();

      const newMessage = {
        text: message,
        user: userName || creatorName,
        timestamp: new Date().toISOString(),
        requiresPassword: true,
        password: password,
        attempts: 0,
        deletionTime: isDestructionActive
          ? Date.now() + destructionTime * 1000
          : null,
      };

      messageRef.set(newMessage);
      setMessage("");
      setReplyingTo(null);
    }
  };

  const handleToggle = () => {
    setIsRotated(!isRotated);
  };

  const reactionTypes = [
    { type: "like", icon: faThumbsUp },
    { type: "love", icon: faHeart },
    { type: "haha", icon: faLaugh },
    { type: "wow", icon: faSurprise },
    { type: "sad", icon: faSadTear },
    { type: "angry", icon: faAngry },
  ];

  const removeReaction = (messageId, reactionType) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const sanitizedUserName = sanitizeUserName(userName || creatorName); // Use o userName do estado

    const reactionRef = database.ref(
      `rooms/${roomId}/messages/${messageId}/reactions/${reactionType}`
    );

    reactionRef.once("value").then((snapshot) => {
      const users = snapshot.val() || [];
      if (users.includes(sanitizedUserName)) {
        const updatedUsers = users.filter((user) => user !== sanitizedUserName);
        if (updatedUsers.length > 0) {
          reactionRef.set(updatedUsers);
        } else {
          reactionRef.remove();
        }
      }
    });
  };

  const addReaction = (messageId, reactionType) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const sanitizedUserName = sanitizeUserName(userName || creatorName); // Use o userName do estado

    const reactionRef = database.ref(
      `rooms/${roomId}/messages/${messageId}/reactions/${reactionType}`
    );

    reactionRef.once("value").then((snapshot) => {
      const users = snapshot.val() || [];
      if (!users.includes(sanitizedUserName)) {
        reactionRef.set([...users, sanitizedUserName]);
      }
    });
  };

  const startNewRoom = () => {
    localStorage.removeItem("tourAsked");
  };

  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=6",
    "https://i.pravatar.cc/150?img=7",
    "https://i.pravatar.cc/150?img=8",
  ];

  const promptPasswordAndDisplayMessage = (msg) => {
    let attemptCount = 0;

    const checkPassword = async () => {
      const { value: enteredPassword, isConfirmed, dismiss } = await Swal.fire({
        title: "Desbloquear Mensagem",
        html: `
      <div style="color: #9d9fa3; font-size: 1rem; margin-bottom: 10px;">
        Digite a senha para visualizar o conteúdo protegido.
      </div>
    `,
        input: "password",
        inputLabel: "Senha",
        inputPlaceholder: "Digite a senha (máx. 10 caracteres)",
        inputAttributes: {
          maxlength: 10,
          autocapitalize: "off",
          autocorrect: "off",
        },

        // Estilos do Modal Principal
        background: '#1e2125', // Fundo escuro
        color: '#E9EDEF',     // Texto claro
        showCancelButton: true,
        confirmButtonText: "Desbloquear",
        cancelButtonText: "Cancelar",
        focusConfirm: true,

        // Classes customizadas para estilização
        customClass: {
          popup: 'bubble-safe-popup-decrypt',
          title: 'bubble-safe-title',
          input: 'bubble-safe-input',
          confirmButton: 'bubble-safe-confirm-button',
          cancelButton: 'bubble-safe-cancel-button',
        },

        // Aplicação de estilos
        didOpen: (popup) => {
          // Estilo do Popup (Borda e Sombra Ciano)
          popup.style.borderRadius = '15px';
          popup.style.border = '1px solid #17a2b8';
          popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

          // Estilo do Título (Ciano)
          const titleElement = popup.querySelector('.bubble-safe-title');
          if (titleElement) {
            titleElement.style.color = '#17a2b8';
            titleElement.style.fontWeight = '700';
            titleElement.style.fontSize = '1.5rem';
          }

          // Estilo do Input (Fundo escuro e Borda Ciano)
          const inputElement = popup.querySelector('.bubble-safe-input');
          if (inputElement) {
            inputElement.style.backgroundColor = '#2c313a';
            inputElement.style.color = '#E9EDEF';
            inputElement.style.border = '2px solid #17a2b8';
            inputElement.style.borderRadius = '8px';
            inputElement.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.6)';
          }

          // Estilo do Botão Confirmar (Ciano)
          const confirmButton = popup.querySelector('.bubble-safe-confirm-button');
          if (confirmButton) {
            confirmButton.style.background = '#17a2b8';
            confirmButton.style.color = 'white';
            confirmButton.style.borderRadius = '8px';
            confirmButton.style.fontWeight = 'bold';
            confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
            confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
          }

          // Estilo do Botão Cancelar (Cinza)
          const cancelButton = popup.querySelector('.bubble-safe-cancel-button');
          if (cancelButton) {
            cancelButton.style.background = '#6c757d';
            cancelButton.style.color = 'white';
            cancelButton.style.borderRadius = '8px';
            cancelButton.style.fontWeight = 'bold';
            cancelButton.onmouseover = () => cancelButton.style.background = '#5a6268';
            cancelButton.onmouseout = () => cancelButton.style.background = '#6c757d';
          }
        },
      });

      if (isConfirmed && enteredPassword) {
        if (enteredPassword === msg.password) {
          // ⭐ Cenário 1: Sucesso (Senha Correta) ⭐
          Swal.fire({
            title: "Acesso Concedido! 🔓",
            html: `<div style="text-align: left; max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #28a745; border-radius: 5px; background-color: #2c313a;">
                 <strong style="color: #28a745;">Mensagem:</strong><br/>${msg.text}
               </div>`,
            icon: "success",
            background: '#1e2125',
            color: '#E9EDEF',
            confirmButtonText: "Fechar",
            customClass: {
              popup: 'bubble-safe-popup-success',
              title: 'bubble-safe-title-success',
              confirmButton: 'bubble-safe-confirm-button-success',
            },
            didOpen: (popup) => {
              popup.style.borderRadius = '15px';
              popup.style.border = '1px solid #28a745';
              popup.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.4)';
              const titleElement = popup.querySelector('.bubble-safe-title-success');
              if (titleElement) titleElement.style.color = '#28a745';
            }
          });
        } else {
          attemptCount++;
          const attemptsLeft = 3 - attemptCount;

          if (attemptCount >= 3) {
            // ⭐ Cenário 3: Bloqueio e Exclusão (3 Tentativas) ⭐
            const messageRef = database.ref(
              `rooms/${roomId}/messages/${msg.id}`
            );
            messageRef.remove();

            Swal.fire({
              title: "Mensagem Autodestruída! 💥",
              text: `A senha estava incorreta 3 vezes. A mensagem foi excluída permanentemente.`,
              icon: "error",
              background: '#1e2125',
              color: '#E9EDEF',
              confirmButtonText: "Entendi",
              customClass: {
                popup: 'bubble-safe-popup-error',
                title: 'bubble-safe-title-error',
                confirmButton: 'bubble-safe-confirm-button-error',
              },
              didOpen: (popup) => {
                popup.style.borderRadius = '15px';
                popup.style.border = '1px solid #dc3545';
                popup.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.4)';
                const titleElement = popup.querySelector('.bubble-safe-title-error');
                if (titleElement) titleElement.style.color = '#dc3545';
              }
            });
          } else {
            // ⭐ Cenário 2: Erro Leve (Tentar Novamente) ⭐
            Swal.fire({
              title: "Senha Incorreta ⚠️",
              text: `Tente novamente. Você tem ${attemptsLeft} tentativa(s) restante(s).`,
              icon: "warning",
              background: '#1e2125',
              color: '#E9EDEF',
              confirmButtonText: "Tentar Novamente",
              customClass: {
                popup: 'bubble-safe-popup-warning',
                title: 'bubble-safe-title-warning',
                confirmButton: 'bubble-safe-confirm-button',
              },
              didOpen: (popup) => {
                popup.style.borderRadius = '15px';
                popup.style.border = '1px solid #ffc107';
                popup.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.4)';
                const titleElement = popup.querySelector('.bubble-safe-title-warning');
                if (titleElement) titleElement.style.color = '#ffc107';
              }
            }).then(checkPassword);
          }
        }
      }
    };

    checkPassword();
  };

  const sendProtectedMessage = () => {
    Swal.fire({
      title: "Proteger Mensagem",
      html: `
      <div style="color: #9d9fa3; font-size: 1rem; margin-bottom: 10px;">
        Digite uma senha para criptografar esta mensagem.
      </div>
    `,
      input: "password",
      inputLabel: "Senha de Proteção",
      inputPlaceholder: "Digite uma senha (máx. 10 caracteres)",
      inputAttributes: {
        maxlength: 10,
        autocapitalize: "off",
        autocorrect: "off",
      },

      // Estilos do Modal
      background: '#1e2125', // Fundo escuro
      color: '#E9EDEF', // Texto claro
      showCancelButton: true,
      confirmButtonText: "Enviar Protegido",
      cancelButtonText: "Cancelar",
      focusConfirm: true,

      // Classes customizadas para estilização
      customClass: {
        popup: 'bubble-safe-popup-protect',
        title: 'bubble-safe-title',
        input: 'bubble-safe-input',
        confirmButton: 'bubble-safe-confirm-button',
        cancelButton: 'bubble-safe-cancel-button',
      },

      // Aplicação de estilos após a abertura
      didOpen: (popup) => {
        // Estilo do Popup (Borda e Sombra Ciano)
        popup.style.borderRadius = '15px';
        popup.style.border = '1px solid #17a2b8';
        popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

        // Estilo do Título (Ciano)
        const titleElement = popup.querySelector('.bubble-safe-title');
        if (titleElement) {
          titleElement.style.color = '#17a2b8';
          titleElement.style.fontWeight = '700';
          titleElement.style.fontSize = '1.5rem';
        }

        // Estilo do Input (Fundo escuro e Borda Ciano)
        const inputElement = popup.querySelector('.bubble-safe-input');
        if (inputElement) {
          inputElement.style.backgroundColor = '#2c313a';
          inputElement.style.color = '#E9EDEF';
          inputElement.style.border = '2px solid #17a2b8';
          inputElement.style.borderRadius = '8px';
          inputElement.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.6)';
        }

        // Estilo do Botão Confirmar (Ciano)
        const confirmButton = popup.querySelector('.bubble-safe-confirm-button');
        if (confirmButton) {
          confirmButton.style.background = '#17a2b8';
          confirmButton.style.color = 'white';
          confirmButton.style.borderRadius = '8px';
          confirmButton.style.fontWeight = 'bold';
          confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
          confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
        }

        // Estilo do Botão Cancelar (Cinza)
        const cancelButton = popup.querySelector('.bubble-safe-cancel-button');
        if (cancelButton) {
          cancelButton.style.background = '#6c757d';
          cancelButton.style.color = 'white';
          cancelButton.style.borderRadius = '8px';
          cancelButton.style.fontWeight = 'bold';
          cancelButton.onmouseover = () => cancelButton.style.background = '#5a6268';
          cancelButton.onmouseout = () => cancelButton.style.background = '#6c757d';
        }
      },
    }).then((result) => {
      if (result.value) {
        // Chama a função existente para enviar a mensagem com a senha
        sendMessageWithPassword(result.value);
      }
    });
  };

  const startRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setRecognitionActive(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage((prevMessage) => prevMessage + " " + transcript);
    };

    recognition.onend = () => {
      setRecognitionActive(false);
    };

    recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event.error);
      setRecognitionActive(false);
    };

    recognition.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecognitionActive(false);
    }
  };

  const sanitizeUserName2 = (userName) => {
    return userName.replace(/[.#$[\]]/g, "_");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = dbRef(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserAvatar(
              snapshot.val().avatar ||
              "https://secure.gravatar.com/avatar/?d=mp"
            );
          } else {
            setUserAvatar("https://secure.gravatar.com/avatar/?d=mp");
          }
        });
      } else {
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    const allowedRef = roomRef.child("allowedUsers");

    const currentUser = auth.currentUser;

    if (currentUser) {
      const sanitizedUserName = sanitizeUserName2(
        currentUser.displayName || currentUser.email
      );
      allowedRef.child(sanitizedUserName).once("value", (snapshot) => {
        if (snapshot.exists()) {
          setHasJoined(true);
        }
      });
    } else {
      console.warn("Usuário não autenticado. currentUser é null.");
    }

    roomRef.once("value", (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        setRoomName(roomData.name);
        setCreatorName(roomData.creatorName || "Moderador");
        setCreatorAvatar(roomData.avatar || null);

        if (currentUser && roomData.creator === currentUser.uid) {
          setIsCreator(true);
          setUserName(roomData.creatorName || "Moderador");

          localStorage.setItem("isCreator", "true");
          localStorage.setItem("userName", roomData.creatorName || "Moderador");
        } else if (currentUser) {
          const sanitizedUserName = sanitizeUserName2(
            currentUser.displayName || currentUser.email
          );
          localStorage.setItem("isCreator", "false");
          localStorage.setItem("userName", sanitizedUserName || "Usuário");
        }
      }
      setIsRoomLoaded(true);
    });
  }, [roomId]);

  useEffect(() => {
    const storedIsCreator = localStorage.getItem("isCreator") === "true";
    const storedUserName = localStorage.getItem("userName");
    const storedCreatorName = localStorage.getItem("creatorName");

    if (storedUserName) {
      setIsCreator(storedIsCreator);
      setUserName(storedUserName);
      setCreatorName(storedCreatorName || "Moderador");
    }
  }, []);

  useEffect(() => {
    const allowedUsersRef = database.ref(`rooms/${roomId}/allowedUsers`);
    const expelledUsersRef = database.ref(`rooms/${roomId}/expelledUsers`);

    allowedUsersRef.on("value", (snapshot) => {
      const usersData = snapshot.val() || {};
      const allowedUsers = Object.keys(usersData);

      expelledUsersRef.once("value", (expelledSnapshot) => {
        const expelledData = expelledSnapshot.val() || {};
        const expelledUsers = Object.keys(expelledData);

        const filteredUsers = allowedUsers.filter(
          (user) => !expelledUsers.includes(user)
        );
        setAllUsers(filteredUsers);
      });
    });

    return () => {
      allowedUsersRef.off();
    };
  }, [roomId]);

  useEffect(() => {
    const handleClickOutside = (event) => {

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (showOptions) {
          setShowOptions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const expelAllUsers = () => {
    const allowedUsersRef = database.ref(`rooms/${roomId}/allowedUsers`);
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers`);

    allowedUsersRef.once("value", (snapshot) => {
      const users = snapshot.val();
      if (users) {
        const expelPromises = Object.keys(users).map((userName) => {
          return expelledRef
            .child(userName)
            .set(true)
            .then(() => {
              allowedUsersRef.child(userName).remove();
              return database.ref(`rooms/${roomId}/messages`).push({
                text: `${userName} foi expulso da sala.`,
                user: "Sistema",
                timestamp: new Date().toISOString(),
              });
            });
        });

        Promise.all(expelPromises)
          .then(() =>
            Swal.fire(
              "Sucesso!",
              "Todos os usuários foram expulsos.",
              "success"
            )
          )
          .catch((error) => console.error("Erro ao expulsar usuários:", error));
      }
    });
  };

  const handleUserSelect = (e) => {
    setSelectedUser(e.target.value);
  };

  const setRoomAccessPassword = async () => {
    const { value: password } = await Swal.fire({
      title: "Definir Acesso Restrito",
      html: `<div style="color: #9d9fa3; font-size: 1rem; margin-bottom: 10px;">Defina uma senha de até 10 caracteres para esta sala.</div>`,
      input: "password",
      inputLabel: "Senha",
      inputPlaceholder: "Digite uma senha para a sala",
      inputAttributes: {
        maxlength: 10,
        autocapitalize: "off",
        autocorrect: "off",
      },

      // Estilos do Modal
      background: '#1e2125', // Fundo escuro
      color: '#E9EDEF', // Texto claro
      showCancelButton: true,
      confirmButtonText: "Ativar Senha",
      cancelButtonText: "Cancelar",
      focusConfirm: true,

      // Classes customizadas para estilização via didOpen
      customClass: {
        popup: 'bubble-safe-popup-password',
        title: 'bubble-safe-title',
        input: 'bubble-safe-input',
        confirmButton: 'bubble-safe-confirm-button',
        cancelButton: 'bubble-safe-cancel-button',
      },

      // Aplicação de estilos após a abertura
      didOpen: (popup) => {
        // Estilo do Popup (Borda e Sombra Ciano)
        popup.style.borderRadius = '15px';
        popup.style.border = '1px solid #17a2b8';
        popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

        // Estilo do Título (Ciano)
        const titleElement = popup.querySelector('.bubble-safe-title');
        if (titleElement) {
          titleElement.style.color = '#17a2b8';
          titleElement.style.fontWeight = '700';
          titleElement.style.fontSize = '1.5rem';
        }

        // Estilo do Input (Fundo escuro e Borda Ciano)
        const inputElement = popup.querySelector('.bubble-safe-input');
        if (inputElement) {
          inputElement.style.backgroundColor = '#2c313a';
          inputElement.style.color = '#E9EDEF';
          inputElement.style.border = '2px solid #17a2b8';
          inputElement.style.borderRadius = '8px';
          inputElement.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.6)';
        }

        // Estilo do Botão Confirmar (Ciano)
        const confirmButton = popup.querySelector('.bubble-safe-confirm-button');
        if (confirmButton) {
          confirmButton.style.background = '#17a2b8';
          confirmButton.style.color = 'white';
          confirmButton.style.borderRadius = '8px';
          confirmButton.style.fontWeight = 'bold';
          confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
          confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
        }

        // Estilo do Botão Cancelar (Cinza)
        const cancelButton = popup.querySelector('.bubble-safe-cancel-button');
        if (cancelButton) {
          cancelButton.style.background = '#6c757d';
          cancelButton.style.color = 'white';
          cancelButton.style.borderRadius = '8px';
          cancelButton.style.fontWeight = 'bold';
          cancelButton.onmouseover = () => cancelButton.style.background = '#5a6268';
          cancelButton.onmouseout = () => cancelButton.style.background = '#6c757d';
        }
      },
    });

    if (password) {
      setRoomPassword(password);
      setIsPasswordEnabled(true);

      database.ref(`rooms/${roomId}`).update({
        roomPassword: password,
        isPasswordEnabled: true,
      });

      // Modal de Sucesso (Também estilizado)
      Swal.fire({
        title: "Senha Definida!",
        text: "O acesso à sala agora requer a senha.",
        icon: "success",
        background: '#1e2125',
        color: '#E9EDEF',
        customClass: {
          popup: 'bubble-safe-popup-success',
          title: 'bubble-safe-title-success',
          confirmButton: 'bubble-safe-confirm-button',
        },
        didOpen: (popup) => {
          popup.style.borderRadius = '15px';
          popup.style.border = '1px solid #28a745'; // Borda verde para sucesso
          popup.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.4)';

          const titleElement = popup.querySelector('.bubble-safe-title-success');
          if (titleElement) {
            titleElement.style.color = '#28a745';
            titleElement.style.fontWeight = '700';
            titleElement.style.fontSize = '1.5rem';
          }

          const confirmButton = popup.querySelector('.bubble-safe-confirm-button');
          if (confirmButton) {
            confirmButton.style.background = '#17a2b8';
            confirmButton.style.color = 'white';
            confirmButton.style.borderRadius = '8px';
            confirmButton.style.fontWeight = 'bold';
            confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
            confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
          }
        }
      });
    }
  };

  const verifyRoomPassword = async () => {
    const snapshot = await database.ref(`rooms/${roomId}`).once("value");
    const roomData = snapshot.val();

    if (roomData && roomData.isPasswordEnabled && roomData.roomPassword) {
      let attemptCount = 0;

      while (attemptCount < 3) {
        const { value: enteredPassword, dismiss } = await Swal.fire({
          title: "Acesso Restrito",
          html: `<div style="color: #9d9fa3; font-size: 1rem; margin-bottom: 10px;">Digite a senha para acessar a sala.</div>`,
          input: "password",
          inputLabel: "Senha",
          inputPlaceholder: "Digite a senha de acesso",
          inputAttributes: {
            maxlength: 10,
            autocapitalize: "off",
            autocorrect: "off",
          },

          // Estilos do Modal
          background: '#1e2125', // Fundo escuro
          color: '#E9EDEF', // Texto claro
          showCancelButton: true,
          confirmButtonText: "Entrar",
          cancelButtonText: "Sair", // Mais claro
          focusConfirm: true,

          // Classes customizadas
          customClass: {
            popup: 'bubble-safe-popup-verify',
            title: 'bubble-safe-title',
            input: 'bubble-safe-input',
            confirmButton: 'bubble-safe-confirm-button',
            cancelButton: 'bubble-safe-cancel-button',
          },

          // Aplicação de estilos após a abertura
          didOpen: (popup) => {
            // Estilo do Popup (Borda e Sombra Ciano)
            popup.style.borderRadius = '15px';
            popup.style.border = '1px solid #17a2b8';
            popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

            // Estilo do Título (Ciano)
            const titleElement = popup.querySelector('.bubble-safe-title');
            if (titleElement) {
              titleElement.style.color = '#17a2b8';
              titleElement.style.fontWeight = '700';
              titleElement.style.fontSize = '1.5rem';
            }

            // Estilo do Input (Fundo escuro e Borda Ciano)
            const inputElement = popup.querySelector('.bubble-safe-input');
            if (inputElement) {
              inputElement.style.backgroundColor = '#2c313a';
              inputElement.style.color = '#E9EDEF';
              inputElement.style.border = '2px solid #17a2b8';
              inputElement.style.borderRadius = '8px';
              inputElement.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.6)';
            }

            // Estilo do Botão Confirmar (Ciano)
            const confirmButton = popup.querySelector('.bubble-safe-confirm-button');
            if (confirmButton) {
              confirmButton.style.background = '#17a2b8';
              confirmButton.style.color = 'white';
              confirmButton.style.borderRadius = '8px';
              confirmButton.style.fontWeight = 'bold';
              confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
              confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
            }

            // Estilo do Botão Cancelar (Cinza)
            const cancelButton = popup.querySelector('.bubble-safe-cancel-button');
            if (cancelButton) {
              cancelButton.style.background = '#6c757d';
              cancelButton.style.color = 'white';
              cancelButton.style.borderRadius = '8px';
              cancelButton.style.fontWeight = 'bold';
              cancelButton.onmouseover = () => cancelButton.style.background = '#5a6268';
              cancelButton.onmouseout = () => cancelButton.style.background = '#6c757d';
            }
          },
        });

        // Se o usuário clicar em Cancelar ou fechar o modal
        if (dismiss === Swal.DismissReason.cancel || dismiss === Swal.DismissReason.close) {
          navigate("/");
          return false;
        }

        if (enteredPassword === roomData.roomPassword) {
          return true;
        } else {
          attemptCount++;
          // setAttempts(attemptCount); // Assumindo que setAttempts é usado para algo na interface

          // ===============================================
          // ⭐ Estilização das Mensagens de Erro (Senha Incorreta) ⭐
          // ===============================================

          if (attemptCount >= 3) {
            Swal.fire({
              title: "Acesso Bloqueado",
              text: "Você excedeu o número de tentativas permitidas.",
              icon: "error",
              background: '#1e2125',
              color: '#E9EDEF',
              confirmButtonText: "Voltar para o Início",
              customClass: {
                popup: 'bubble-safe-popup-error',
                title: 'bubble-safe-title-error',
                confirmButton: 'bubble-safe-confirm-button-error',
              },
              didOpen: (popup) => {
                popup.style.borderRadius = '15px';
                popup.style.border = '1px solid #dc3545';
                popup.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.4)';

                const titleElement = popup.querySelector('.bubble-safe-title-error');
                if (titleElement) titleElement.style.color = '#dc3545';

                const confirmButton = popup.querySelector('.bubble-safe-confirm-button-error');
                if (confirmButton) {
                  confirmButton.style.background = '#dc3545';
                  confirmButton.style.color = 'white';
                  confirmButton.style.borderRadius = '8px';
                  confirmButton.style.fontWeight = 'bold';
                  confirmButton.onmouseover = () => confirmButton.style.background = '#c82333';
                  confirmButton.onmouseout = () => confirmButton.style.background = '#dc3545';
                }
              }
            }).then(() => {
              navigate("/"); // Garante o redirecionamento após o usuário fechar o alerta
            });
            return false;
          } else {
            Swal.fire({
              title: "Senha Incorreta!",
              text: `Você tem ${3 - attemptCount} tentativa(s) restante(s).`,
              icon: "warning",
              background: '#1e2125',
              color: '#E9EDEF',
              confirmButtonText: "Tentar Novamente",
              customClass: {
                popup: 'bubble-safe-popup-warning',
                title: 'bubble-safe-title-warning',
                confirmButton: 'bubble-safe-confirm-button-warning',
              },
              didOpen: (popup) => {
                popup.style.borderRadius = '15px';
                popup.style.border = '1px solid #ffc107'; // Borda amarela para aviso
                popup.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.4)';

                const titleElement = popup.querySelector('.bubble-safe-title-warning');
                if (titleElement) titleElement.style.color = '#ffc107';

                const confirmButton = popup.querySelector('.bubble-safe-confirm-button-warning');
                if (confirmButton) {
                  confirmButton.style.background = '#17a2b8';
                  confirmButton.style.color = 'white';
                  confirmButton.style.borderRadius = '8px';
                  confirmButton.style.fontWeight = 'bold';
                  confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
                  confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
                }
              }
            });
            // O loop while voltará para a próxima tentativa
          }
        }
      }
    }
    return true;
  };

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await verifyRoomPassword();
      if (!hasAccess) {
        navigate("/");
      }
    };

    if (!isCreator && !hasJoined) {
      checkAccess();
    }
  }, [isCreator, hasJoined, roomId, navigate]);

  useEffect(() => {
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers`);
    expelledRef.on("value", (snapshot) => {
      const expelledData = snapshot.val() || {};
      setExpelledUsers(Object.keys(expelledData));
    });

    return () => {
      expelledRef.off();
    };
  }, [roomId]);

  useEffect(() => {
    const handleUserExit = () => {
      if (!isReloading && !isCreator) {
        const messageRef = database.ref(`rooms/${roomId}/messages`).push();
        messageRef.set({
          text: `${userName} saiu da sala.`,
          user: "Sistema",
          timestamp: new Date().toISOString(),
        });
      }
    };

    const beforeUnloadHandler = (event) => {
      setIsReloading(true);
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);
    window.addEventListener("unload", handleUserExit);

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("unload", handleUserExit);
    };
  }, [userName, roomId, isCreator, isReloading]);

  useEffect(() => {
    setIsReloading(false);
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio
      .play()
      .catch((error) => console.error("Erro ao reproduzir áudio:", error));
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);

    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    const messagesRef = database.ref(`rooms/${roomId}/messages`);
    messagesRef.on("value", (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const parsedMessages = Object.entries(messagesData).map(
          ([key, value]) => ({
            id: key,
            ...value,
          })
        );
        setMessages(parsedMessages);
      }
    });

    return () => {
      messagesRef.off();
    };
  }, [roomId]);

  useEffect(() => {
    if (hasInteracted && messages.length > previousMessageCount.current) {
      playNotificationSound();
    }
    previousMessageCount.current = messages.length;
  }, [messages, hasInteracted]);

  useEffect(() => {
    if (messagesEndRef.current) {
      const messageContainer = document.querySelector(".message-container");
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      const messageContainer = document.querySelector(".message-container");
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  useEffect(() => {
    const handleFocus = () => setIsKeyboardVisible(true);
    const handleBlur = () => setIsKeyboardVisible(false);

    const inputElement = inputRef.current;

    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus);
      inputElement.addEventListener("blur", handleBlur);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("focus", handleFocus);
        inputElement.removeEventListener("blur", handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    const messageContainer = messageContainerRef.current;
    if (messageContainer) {
      if (isKeyboardVisible) {
        messageContainer.style.height = "calc(100vh - 250px)";
      } else {
        messageContainer.style.height = "calc(100vh - 60px)";
      }
    }
  }, [isKeyboardVisible]);

  const markMessageAsRead = (messageId) => {
    const readByRef = database.ref(
      `rooms/${roomId}/messages/${messageId}/readBy`
    );
    readByRef.once("value", (snapshot) => {
      const readBy = snapshot.val() || [];
      if (!readBy.includes(userName)) {
        readByRef.set([...readBy, userName]);
      }
    });
  };

  const markAllMessagesAsRead = () => {
    messages.forEach((msg) => {
      markMessageAsRead(msg.id);
    });
  };

  const autoDestructMessages = () => {
    if (isDestructionActive) {
      messages.forEach((msg) => {
        const timeSinceCreation =
          (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
        if (timeSinceCreation >= destructionTime) {
          const messageRef = database.ref(`rooms/${roomId}/messages/${msg.id}`);
          messageRef.once("value", (snapshot) => {
            const messageData = snapshot.val();
            if (messageData && messageData.audioUrl) {
              const audioRef = storage.refFromURL(messageData.audioUrl);
              audioRef.delete().catch((error) => {
                console.error("Erro ao deletar áudio:", error);
              });
            }
            messageRef.remove();
          });
        }
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      autoDestructMessages();
    }, 1000);

    return () => clearInterval(interval);
  }, [messages, destructionTime, isDestructionActive]);

  useEffect(() => {
    const typingRef = database.ref(`rooms/${roomId}/typing`);
    typingRef.on("value", (snapshot) => {
      const typingData = snapshot.val() || {};
      setTypingUsers(Object.values(typingData).filter(Boolean));
    });

    return () => {
      typingRef.off();
    };
  }, [roomId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTimes) => {
        const newTimes = {};
        messages.forEach((msg) => {
          if (msg.deletionTime) {
            const timeRemaining = (msg.deletionTime - Date.now()) / 1000;
            if (timeRemaining > 0) {
              newTimes[msg.id] = timeRemaining.toFixed(0);
            } else {
              newTimes[msg.id] = 0;
            }
          }
        });
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [messages]);

  useEffect(() => {
    if (isCreator) {
      const requestsRef = database.ref(`rooms/${roomId}/requests`);
      requestsRef.on("value", (snapshot) => {
        const requestsData = snapshot.val();
        if (requestsData) {
          const parsedRequests = Object.entries(requestsData).map(
            ([key, value]) => ({
              id: key,
              ...value,
            })
          );
          setPendingRequests(parsedRequests);
        } else {
          setLoading(false);
        }
      });

      return () => {
        requestsRef.off();
      };
    }
  }, [isCreator, roomId]);

  const handleRequest = (userId, decision) => {
    const requestRef = database.ref(`rooms/${roomId}/requests/${userId}`);

    if (decision === "accept") {
      requestRef.once("value", (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const allowedRef = database.ref(
            `rooms/${roomId}/allowedUsers/${userData.userName}`
          );
          allowedRef.set(true).then(() => {
            database.ref(`rooms/${roomId}/messages`).push({
              text: `${userData.userName} foi autorizado a entrar na sala.`,
              user: "Sistema",
              timestamp: new Date().toISOString(),
            });
            setUsersWithExpelButton(
              (prevUsers) => new Set([...prevUsers, userData.userName])
            );
            setLoading(false);
          });
        }
      });
    } else if (decision === "deny") {
      requestRef.once("value", (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const denyRef = database.ref(
            `rooms/${roomId}/deniedRequests/${userData.userName}`
          );
          denyRef
            .set({
              message: `Sua solicitação foi recusada.`,
              timestamp: new Date().toISOString(),
            })
            .then(() => {
              Swal.fire({
                icon: "error",
                title: "Solicitação Recusada",
                text: `A solicitação de ${userData.userName} foi recusada com sucesso.`,
                confirmButtonText: "OK",
              });
              setLoading(false);
            });
        }
      });
    }

    requestRef
      .remove()
      .then(() => {
        setPendingRequests((prevRequests) =>
          prevRequests.filter((req) => req.id !== userId)
        );
      })
      .catch((error) => {
        console.error("Erro ao processar a solicitação:", error);
      });
  };

  const requestAccess = () => {
    if (!userName.trim()) {
      setStatusMessage("Nome de usuário é obrigatório.");
      return;
    }

    setLoading(true);

    const requestsRef = database.ref(`rooms/${roomId}/requests`).push();
    requestsRef
      .set({
        userName,
        timestamp: new Date().toISOString(),
      })
      .then(() => {
        setHasRequestedAccess(true);
        setStatusMessage("Solicitação de entrada enviada. Aguarde aprovação.");
      })
      .catch((error) => {
        console.log("Erro ao enviar solicitação:", error);
        setStatusMessage("Erro ao enviar solicitação. Tente novamente.");
      });

    setShowAvatarModal(true);
  };

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on("value", (snapshot) => {
      const roomData = snapshot.val();

      if (roomData && roomData.isClosed) {
        Swal.fire({
          title: "Sala Encerrada",
          text: "A sala foi encerrada pelo criador. Redirecionando...",
          icon: "info",
          confirmButtonText: "Ok",
        }).then(() => {
          navigate("/");
        });
        return;
      }

      if (roomData && roomData.isDestructionActive !== undefined) {
        setIsDestructionActive(roomData.isDestructionActive);
        setDestructionTime(roomData.destructionTime || 10);
      } else {
        setIsDestructionActive(false);
        setDestructionTime(10);
      }
    });

    return () => roomRef.off();
  }, [roomId, navigate]);

  useEffect(() => {
    const storedRoomAccess = localStorage.getItem(`hasJoined_${roomId}`);
    const storedUserName = localStorage.getItem("userName");

    if (storedRoomAccess === "true" && storedUserName === userName) {
      setHasJoined(true);
    }

    if (!hasRequestedAccess && storedRoomAccess !== "true") return;
    const allowedRef = database.ref(`rooms/${roomId}/allowedUsers/${userName}`);
    const deniedRef = database.ref(
      `rooms/${roomId}/deniedRequests/${userName}`
    );
    const expelledRef = database.ref(
      `rooms/${roomId}/expelledUsers/${userName}`
    );

    expelledRef.on("value", (snapshot) => {
      if (snapshot.exists() && !isCreator) {
        Swal.fire({
          icon: "error",
          title: "Acesso Negado",
          text: "Você foi expulso da sala e não pode solicitar acesso novamente.",
          confirmButtonText: "Ok",
        }).then(() => {
          navigate("/login");
        });
      }
    });

    allowedRef.on("value", (snapshot) => {
      if (snapshot.exists()) {
        setHasJoined(true);
        localStorage.setItem(`hasJoined_${roomId}`, "true");
        localStorage.setItem("userName", userName);

        setStatusMessage("Você foi aceito na sala. Redirecionando...");

        setTimeout(() => {
          setStatusMessage("");
          navigate(`/room/${roomId}`);
        }, 2000);
      }
    });

    deniedRef.on("value", (snapshot) => {
      if (snapshot.exists() && !isCreator) {
        Swal.fire({
          icon: "error",
          title: "Solicitação Recusada",
          text: "Sua solicitação de acesso foi recusada. Redirecionando...",
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            navigate("/");
          },
        });
      }
    });

    return () => {
      allowedRef.off();
      deniedRef.off();
      expelledRef.off();
    };
  }, [roomId, userName, navigate, isCreator, hasRequestedAccess]);

  const sanitizeUserName = (userName) => {
    return userName.replace(/[.#$[\]]/g, "_");
  };

  const expelUser = (userName) => {
    const expelledRef = database.ref(
      `rooms/${roomId}/expelledUsers/${userName}`
    );
    expelledRef
      .set(true)
      .then(() => {
        database.ref(`rooms/${roomId}/messages`).push({
          text: `${userName} foi expulso da sala.`,
          user: "Sistema",
          timestamp: new Date().toISOString(),
        });

        setAllUsers((prevUsers) =>
          prevUsers.filter((user) => user !== userName)
        );
        setSelectedUser("");
      })
      .catch((error) => {
        console.error("Erro ao expulsar usuário:", error);
      });
  };

  const sendMessage = () => {
    if (message.trim()) {
      const deletionTime = Date.now() + destructionTime * 1000;
      const messageRef = database.ref(`rooms/${roomId}/messages`).push();

      const encryptedText = encryptMessage(message);

      const newMessage = {
        text: encryptedText,
        user: userName || creatorName,
        timestamp: new Date().toISOString(),
        deletionTime: isDestructionActive ? deletionTime : null,
        avatar: userAvatar || selectedAvatar,
      };

      if (replyingTo) {
        newMessage.replyTo = {
          id: replyingTo.id,
          user: replyingTo.user,
          text: replyingTo.text,
        };
      }

      messageRef.set(newMessage);
      setMessage("");
      setTyping(false);
      setReplyingTo(null);
    }
  };

  const setTyping = (isTyping) => {
    const typingRef = database.ref(`rooms/${roomId}/typing/${userName}`);
    typingRef.set(isTyping ? userName : null);

    if (isTyping) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 3000);
    }
  };

  const handleTyping = (e) => {
    const input = e.target.value;
    setMessage(input);

    if (input.trim() !== "") {
      setShowPlusButton(true);
      setShowOptions(false);
    } else {
      setShowPlusButton(false);
    }
  };

  const leaveRoom = () => {
    const messageRef = database.ref(`rooms/${roomId}/messages`).push();
    const sanitizedUserName = sanitizeUserName(userName);

    messageRef
      .set({
        text: `${userName} saiu da sala.`,
        user: "Sistema",
        timestamp: new Date().toISOString(),
      })
      .then(() => {
        const allowedUsersRef = database.ref(
          `rooms/${roomId}/allowedUsers/${sanitizedUserName}`
        );
        allowedUsersRef
          .remove()
          .then(() => {
            setStatusMessage("Você saiu da sala.");
            setTimeout(() => {
              localStorage.removeItem(`hasJoined_${roomId}`);
              navigate("/");
            }, 1000);
          })
          .catch((error) => {
            console.error(
              "Erro ao remover o usuário da lista de permitidos:",
              error
            );
          });
      })
      .catch((error) => {
        console.error("Erro ao enviar mensagem de saída:", error);
      });
  };

  const deleteChat = async () => {
    try {
      await database.ref(`rooms/${roomId}`).update({
        isClosed: true,
      });

      await database.ref(`rooms/${roomId}/messages`).push({
        text: `A sala foi encerrada pelo moderador.`,
        user: "Sistema",
        timestamp: new Date().toISOString(),
      });

      const messagesSnapshot = await database
        .ref(`rooms/${roomId}/messages`)
        .once("value");
      const messages = messagesSnapshot.val();

      if (messages) {
        const deletePromises = Object.keys(messages).map(async (msgId) => {
          const msg = messages[msgId];

          if (msg.audioUrl) {
            const audioRef = storage.refFromURL(msg.audioUrl);
            try {
              await audioRef.delete();
              console.log(
                `Arquivo de áudio ${msg.audioUrl} deletado com sucesso.`
              );
            } catch (error) {
              console.error(
                `Erro ao deletar o arquivo de áudio ${msg.audioUrl}:`,
                error
              );
            }
          }
          await database.ref(`rooms/${roomId}/messages/${msgId}`).remove();
        });

        await Promise.all(deletePromises);
      }
      await database.ref(`rooms/${roomId}`).remove();
      let timerInterval;

      setHasJoined(false);
      setUserName("");
      Swal.fire({
        title: "Excluindo sala arquivos e mensagens!!",
        icon: "info",
        html: "Irei fechar em <b></b> milissegundos.",
        timer: 1300,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector("b");
          timerInterval = setInterval(() => {
            timer.textContent = Swal.getTimerLeft();
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then(() => {
        setTimeout(() => {
          navigate("/");
        }, 100);
        Swal.fire({
          title: "Sucesso!",
          text: "Sala e arquivos e mensagens excluídos com sucesso!",
          icon: "success",
          confirmButtonText: "Ok",
        });
      });
    } catch (error) {
      console.error("Erro ao excluir a sala e arquivos:", error);
      setStatusMessage("Erro ao excluir a sala. Tente novamente.");
    }
  };

  const toggleDestruction = async () => {
    if (!isDestructionActive) {
      const { value: destructionTime } = await Swal.fire({
        title: "Configurar Autodestruição",
        html: `
        <div style="font-size: 1rem; color: #E9EDEF; margin-bottom: 10px;">
          Escolha o tempo de vida da mensagem (em segundos).
        </div>
      `,
        input: "number",
        inputAttributes: {
          min: 1,
          max: 300,
        },
        // Estilização do Modal
        background: '#1e2125', // Fundo escuro
        color: '#E9EDEF', // Texto claro
        showCancelButton: true,
        confirmButtonText: "Ativar",
        cancelButtonText: "Cancelar",
        focusConfirm: true,

        // Classes customizadas
        customClass: {
          popup: 'bubble-safe-popup',
          title: 'bubble-safe-title',
          input: 'bubble-safe-input',
          confirmButton: 'bubble-safe-confirm-button',
          cancelButton: 'bubble-safe-cancel-button',
        },

        // Validação
        inputValidator: (value) => {
          if (!value) {
            return "Você deve inserir um número!";
          }
          if (value < 1 || value > 300) {
            return "O tempo deve ser entre 1 e 300 segundos!";
          }
        },

        // Estilização aplicada após a abertura
        didOpen: (popup) => {
          popup.style.borderRadius = '15px';
          popup.style.border = '1px solid #17a2b8';
          popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

          const titleElement = popup.querySelector('.bubble-safe-title');
          if (titleElement) {
            titleElement.style.color = '#17a2b8';
            titleElement.style.fontWeight = '700';
            titleElement.style.fontSize = '1.5rem';
          }

          const inputElement = popup.querySelector('.bubble-safe-input');
          if (inputElement) {
            inputElement.style.backgroundColor = '#2c313a';
            inputElement.style.color = '#E9EDEF';
            inputElement.style.border = '2px solid #17a2b8';
            inputElement.style.borderRadius = '8px';
            inputElement.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.6)';
          }

          const confirmButton = popup.querySelector('.bubble-safe-confirm-button');
          if (confirmButton) {
            confirmButton.style.background = '#17a2b8';
            confirmButton.style.color = 'white';
            confirmButton.style.borderRadius = '8px';
            confirmButton.style.fontWeight = 'bold';
            confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
            confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
          }

          const cancelButton = popup.querySelector('.bubble-safe-cancel-button');
          if (cancelButton) {
            cancelButton.style.background = '#6c757d';
            cancelButton.style.color = 'white';
            cancelButton.style.borderRadius = '8px';
            cancelButton.style.fontWeight = 'bold';
            cancelButton.onmouseover = () => cancelButton.style.background = '#5a6268';
            cancelButton.onmouseout = () => cancelButton.style.background = '#6c757d';
          }
        },
      });

      if (destructionTime) {
        setDestructionTime(destructionTime);
        setIsDestructionActive(true);

        database.ref(`rooms/${roomId}`).update({
          isDestructionActive: true,
          destructionTime,
        });

        database.ref(`rooms/${roomId}/messages`).push({
          text: "O Moderador ativou as mensagens autodestrutivas.",
          user: "Sistema",
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Modal de confirmação para desativar (também estilizado)
      const result = await Swal.fire({
        title: "Desativar Autodestruição?",
        text: "As mensagens futuras não serão mais apagadas automaticamente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, Desativar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,

        // Estilização do Modal
        background: '#1e2125',
        color: '#E9EDEF',

        // Classes customizadas
        customClass: {
          popup: 'bubble-safe-popup',
          title: 'bubble-safe-title-warning',
          confirmButton: 'bubble-safe-confirm-button-danger',
          cancelButton: 'bubble-safe-cancel-button',
        },

        // Estilização aplicada após a abertura
        didOpen: (popup) => {
          popup.style.borderRadius = '15px';
          popup.style.border = '1px solid #dc3545'; // Borda vermelha para aviso
          popup.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.4)';

          const titleElement = popup.querySelector('.bubble-safe-title-warning');
          if (titleElement) {
            titleElement.style.color = '#dc3545';
            titleElement.style.fontWeight = '700';
            titleElement.style.fontSize = '1.5rem';
          }

          const confirmButton = popup.querySelector('.bubble-safe-confirm-button-danger');
          if (confirmButton) {
            confirmButton.style.background = '#dc3545'; // Botão de desativação vermelho
            confirmButton.style.color = 'white';
            confirmButton.style.borderRadius = '8px';
            confirmButton.style.fontWeight = 'bold';
            confirmButton.onmouseover = () => confirmButton.style.background = '#c82333';
            confirmButton.onmouseout = () => confirmButton.style.background = '#dc3545';
          }

          const cancelButton = popup.querySelector('.bubble-safe-cancel-button');
          if (cancelButton) {
            cancelButton.style.background = '#6c757d';
            cancelButton.style.color = 'white';
            cancelButton.style.borderRadius = '8px';
            cancelButton.style.fontWeight = 'bold';
            cancelButton.onmouseover = () => cancelButton.style.background = '#5a6268';
            cancelButton.onmouseout = () => cancelButton.style.background = '#6c757d';
          }
        },
      });

      if (result.isConfirmed) {
        setIsDestructionActive(false);

        database.ref(`rooms/${roomId}`).update({
          isDestructionActive: false,
        });

        database.ref(`rooms/${roomId}/messages`).push({
          text: "O Moderador desativou as mensagens autodestrutivas.",
          user: "Sistema",
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        streamRef.current = stream;
        setRecording(true);

        mediaRecorder.ondataavailable = (event) => {
          const audioBlob = new Blob([event.data], { type: "audio/mp3" });
          setAudioFile(audioBlob);
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.error("Erro ao acessar o microfone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      setRecording(false);
    }
  };

  const sendAudioMessage = () => {
    if (audioFile) {
      const storageRef = storage.ref();
      const audioRef = storageRef.child(
        `rooms/${roomId}/audio_${Date.now()}.mp3`
      );
      const uploadTask = audioRef.put(audioFile);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Erro ao enviar áudio:", error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            const messageRef = database.ref(`rooms/${roomId}/messages`).push();
            const audioMessage = {
              audioUrl: downloadURL,
              user: userName || creatorName,
              timestamp: new Date().toISOString(),
            };
            messageRef.set(audioMessage);
            setAudioFile(null);
          });
        }
      );
    }
  };

  let progressInterval = null;

  const updateProgress = (audio, messageId) => {
    // Limpa qualquer intervalo anterior
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    // Inicia um novo intervalo para atualizar a cada 100ms
    progressInterval = setInterval(() => {
      if (audio.duration) {
        const percentage = (audio.currentTime / audio.duration) * 100;

        // Atualiza o estado do progresso apenas para a mensagem atual
        setAudioProgress(prev => ({
          ...prev,
          [messageId]: percentage
        }));
      }
    }, 100);
  };

  const playAudio = (audioUrl, messageId) => {
    if (currentAudio && currentAudio.src === audioUrl && currentAudio.currentTime > 0) {
      currentAudio.play();
      setPlayingAudioId(messageId);
      updateProgress(currentAudio, messageId); // **REINICIA O PROGRESSO**
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      if (progressInterval) clearInterval(progressInterval); // Limpa o anterior
    }

    const audio = new Audio(audioUrl);

    audio.onended = () => {
      audio.currentTime = 0;
      setPlayingAudioId(null);
      setCurrentAudio(null);
      setAudioProgress(prev => ({ // Reseta o progresso visual
        ...prev,
        [messageId]: 0
      }));
      if (progressInterval) clearInterval(progressInterval); // Para o loop
    };

    audio.play();
    setPlayingAudioId(messageId);
    setCurrentAudio(audio);
    updateProgress(audio, messageId); // **INICIA O PROGRESSO**
  };

  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setPlayingAudioId(null);
      if (progressInterval) clearInterval(progressInterval);
    }
  };

  const togglePlayPause = (audioUrl, messageId) => {
    if (playingAudioId === messageId) {
      pauseAudio();
    } else {
      playAudio(audioUrl, messageId);
    }
  };

  const showShareModal = () => {
    const contentString = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
      
      <button id="copyLink" style="
        background: linear-gradient(135deg, #17a2b8, #138496); 
        color: white; 
        border: none; 
        border-radius: 10px; 
        padding: 15px 10px; 
        font-weight: bold; 
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(23, 162, 184, 0.4);
        transition: all 0.2s ease;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-height: 90px;
        font-size: 0.9rem;
      " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 15px rgba(23, 162, 184, 0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(23, 162, 184, 0.4)';">
        <i class="fas fa-link fa-2x"></i>
        <span style="margin-top: 8px;">Copiar Link</span>
      </button>

      <button id="whatsappLink" style="
        background: linear-gradient(135deg, #25D366, #128C7E); 
        color: white; 
        border: none; 
        border-radius: 10px; 
        padding: 15px 10px; 
        font-weight: bold; 
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(37, 211, 102, 0.4);
        transition: all 0.2s ease;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-height: 90px;
        font-size: 0.9rem;
      " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 15px rgba(37, 211, 102, 0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(37, 211, 102, 0.4)';">
        <i class="fab fa-whatsapp fa-2x"></i>
        <span style="margin-top: 8px;">WhatsApp</span>
      </button>
      
      <button id="emailLink" style="
        background: linear-gradient(135deg, #6c757d, #5a6268); 
        color: white; 
        border: none; 
        border-radius: 10px; 
        padding: 15px 10px; 
        font-weight: bold; 
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(108, 117, 125, 0.4);
        transition: all 0.2s ease;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-height: 90px;
        font-size: 0.9rem;
      " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 15px rgba(108, 117, 125, 0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(108, 117, 125, 0.4)';">
        <i class="fas fa-envelope fa-2x"></i>
        <span style="margin-top: 8px;">E-mail</span>
      </button>

      <button id="telegramLink" style="
        background: linear-gradient(135deg, #0088CC, #006EAA); 
        color: white; 
        border: none; 
        border-radius: 10px; 
        padding: 15px 10px; 
        font-weight: bold; 
        cursor: pointer;
        box-shadow: 0 4px 10px rgba(0, 136, 204, 0.4);
        transition: all 0.2s ease;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        min-height: 90px;
        font-size: 0.9rem;
      " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 15px rgba(0, 136, 204, 0.6)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(0, 136, 204, 0.4)';">
        <i class="fab fa-telegram-plane fa-2x"></i>
        <span style="margin-top: 8px;">Telegram</span>
      </button>
    </div>
  `;

    Swal.fire({
      title: "Escolha uma opção para compartilhar",
      html: contentString,
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false,
      background: '#1e2125',
      color: '#E9EDEF',
      customClass: {
        popup: 'bubble-safe-popup',
        title: 'bubble-safe-title',
        closeButton: 'bubble-safe-close-button'
      },
      didOpen: (popup) => {
        popup.style.borderRadius = '15px';
        popup.style.border = '1px solid #17a2b8';
        popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

        const titleElement = popup.querySelector('.bubble-safe-title');
        if (titleElement) {
          titleElement.style.color = '#17a2b8';
          titleElement.style.fontWeight = '700';
          titleElement.style.fontSize = '1.5rem';
        }

        const closeButton = popup.querySelector('.bubble-safe-close-button');
        if (closeButton) {
          closeButton.style.color = '#E9EDEF';
          closeButton.style.fontSize = '1.2rem';
          closeButton.onmouseover = () => closeButton.style.color = '#dc3545';
          closeButton.onmouseout = () => closeButton.style.color = '#E9EDEF';
        }

        // Lógica de Eventos (Permanece a mesma, só ajustei o Swal.close() do sucesso)
        document.getElementById("copyLink").addEventListener("click", () => {
          Swal.close(); // Fecha o modal de compartilhamento antes de mostrar o toast
          navigator.clipboard
            .writeText(shareLink2)
            .then(() => {
              Swal.fire({
                title: "Copiado!",
                text: "Link copiado para a área de transferência!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                background: '#1e2125',
                color: '#E9EDEF',
                position: 'top-end',
                toast: true
              });
            })
            .catch((err) => {
              console.error("Erro ao copiar: ", err);
            });
        });

        document.getElementById("emailLink").addEventListener("click", () => {
          window.open(
            `mailto:?subject=Compartilhe este link&body=Confira este link do chat: ${shareLink2}`,
            "_blank",
            "noopener,noreferrer"
          );
          Swal.close();
        });

        document
          .getElementById("whatsappLink")
          .addEventListener("click", () => {
            window.open(
              `https://api.whatsapp.com/send?text=Confira este link do chat: ${shareLink2}`,
              "_blank",
              "noopener,noreferrer"
            );
            Swal.close();
          });

        document
          .getElementById("telegramLink")
          .addEventListener("click", () => {
            window.open(
              `https://t.me/share/url?url=${shareLink2}&text=Confira este link do chat:`,
              "_blank",
              "noopener,noreferrer"
            );
            Swal.close();
          });
      },
    });
  };

  const confirmAction = (actionType) => {
    switch (actionType) {
      case "share":
        showShareModal();
        break;
      case "delete":
        Swal.fire({
          title: "Excluir Chat",
          text: "Você tem certeza que deseja excluir o chat? Esta ação não pode ser desfeita.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Sim",
          cancelButtonText: "Não",
        }).then((result) => {
          if (result.isConfirmed) {
            deleteChat();
          }
        });
        break;
      case "qr":
        showQRCode();
        break;
      default:
        return;
    }
  };

  const messageStyles = (isSentByUser) => ({
    backgroundColor: isSentByUser ? "#00305cff" : "#262d31",
    padding: "10px 12px",
    borderRadius: isSentByUser ? "18px 18px 0 18px" : "18px 18px 18px 0",
    maxWidth: "85%",
    marginLeft: isSentByUser ? "auto" : "unset",
    marginRight: isSentByUser ? "unset" : "auto",
    marginBottom: "12px",
    position: "relative",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  });

  const replyPreviewStyles = {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderLeft: "4px solid #e3f6f2ff",
    padding: "6px 10px",
    borderRadius: "4px",
    marginTop: "5px",
    marginBottom: "10px",
    fontSize: "0.85em",
    color: "#ffffffff",
    cursor: "pointer",
  };

  const QRCodeModal = ({ shareLink }) => {
    const handleCopy = () => {
      navigator.clipboard.writeText(shareLink);
      Swal.fire({
        title: 'Copiado!',
        text: 'O link da sala foi copiado para a área de transferência.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#1e2125',
        color: '#E9EDEF',
        position: 'top-end',
        toast: true
      });
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "100%",
          padding: "10px",
        }}
      >
        <div
          style={{
            padding: '10px',
            backgroundColor: '#fff',
            borderRadius: '12px',
            margin: '15px auto',
            border: '4px solid #17a2b8',
            boxShadow: '0 0 15px rgba(23, 162, 184, 0.6)'
          }}
        >
          <QRCodeCanvas
            value={shareLink}
            size={Math.min(window.innerWidth * 0.8, 190)}
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              display: 'block'
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: '#2c313a',
            borderRadius: '8px',
            padding: '10px',
            marginTop: '15px',
            border: '1px solid #17a2b8',
            width: '100%',
            textAlign: 'center',
            display: 'none'
          }}
        >
          <p style={{ margin: 0, color: '#9d9fa3', fontSize: '0.8rem' }}>Link para Compartilhar:</p>
          <code
            style={{
              color: 'transparent',
              overflowWrap: 'break-word',
              fontSize: '0.9rem',
              display: 'block'
            }}
          >
            {shareLink}
          </code>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-info mt-3 w-100"
          style={{
            backgroundColor: '#17a2b8',
            borderColor: '#17a2b8',
            fontWeight: 'bold',
            borderRadius: '8px',
            transition: 'background-color 0.3s, transform 0.2s',
            height: '45px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
        >
          <FontAwesomeIcon icon={faCopy} className="me-2" />
          Copiar Link
        </button>

        <p className="d-none">Link: {shareLink}</p>
      </div>
    );
  };

  const showQRCode = () => {
    const modalContent = document.createElement("div");
    ReactDOM.render(<QRCodeModal shareLink={shareLink2} />, modalContent);

    Swal.fire({
      title: `<span style="color: #17a2b8; font-weight: 700; font-size: 1.5rem;"><i class="fas fa-qrcode"></i> Compartilhar Sala Segura</span>`,
      html: modalContent,
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false,
      background: '#1e2125',
      color: '#E9EDEF',
      customClass: {
        popup: 'bubble-safe-popup-qr',
        closeButton: 'bubble-safe-close-button'
      },
      didOpen: (popup) => {
        popup.style.borderRadius = '15px';
        popup.style.border = '1px solid #17a2b8';
        popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

        const closeButton = popup.querySelector('.bubble-safe-close-button');
        if (closeButton) {
          closeButton.style.color = '#E9EDEF';
          closeButton.style.fontSize = '1.2rem';
          closeButton.onmouseover = () => closeButton.style.color = '#dc3545';
          closeButton.onmouseout = () => closeButton.style.color = '#E9EDEF';
        }
      }
    });
  };

  if (!hasJoined && !isCreator) {
    return (
      <div className="container mt-5 d-flex justify-content-center mb-5">
        <motion.div
          className="card p-4 shadow bg-dark text-light mt-5 mb-5"
          style={{ width: "100%", maxWidth: "800px" }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4 img-fluid"
            style={{ maxWidth: "280px" }}
            src={iconPage}
            alt="OpenSecurityRoom"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <motion.h1
            className="text-center mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Solicitação de Entrada
          </motion.h1>
          <motion.p
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Insira seu nome ou nick para solicitação de acesso à sala
          </motion.p>

          <div className="d-flex justify-content-center">
            {/* Input de Nome/Nick */}
            <motion.input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome ou nick"
              className="form-control"
              // O max-width e width garantem que o input ocupe o espaço restante
              style={{ maxWidth: "100%", width: "100%", borderRadius: "10rem" }}
              autoFocus
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            />

            {/* Botão de Solicitação de Acesso (Visível somente com texto) */}
            {userName.trim() && (
              <motion.button
                onClick={requestAccess}
                disabled={loading} // O disabled por texto já é coberto pela renderização condicional
                className="btn btn-primary ms-2 d-flex align-items-center justify-content-center" // Adiciona flex para centralizar o ícone
                whileHover={{ scale: 1.05 }} // Ajustei um pouco o hover para ser menos agressivo
                whileTap={{ scale: 0.95 }} // Ajustei um pouco o tap
                initial={{ opacity: 0, x: -10 }} // Adicionei um pequeno movimento ao aparecer
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                // Ajustamos o estilo para o botão azul com o mesmo raio do input
                style={{
                  borderRadius: "10rem",
                  width: "48px", // Largura fixa para um botão quadrado/circular pequeno
                  height: "48px", // Altura fixa para um botão quadrado/circular pequeno
                  flexShrink: 0, // Garante que o botão não encolha
                }}
              >
                <FontAwesomeIcon icon={faArrowRight} size="lg" /> {/* Use faArrowRight e ajuste o tamanho */}
              </motion.button>
            )}
          </div>

          {loading && (
            <motion.div
              className="d-flex justify-content-center mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="spinner-border colorful-spinner"
                role="status"
              ></div>
            </motion.div>
          )}

          {statusMessage && (
            <motion.div
              className="alert alert-info text-center mt-3"
              role="alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {statusMessage}
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!isRoomLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Spinner animation="border" role="status" variant="primary" />
      </motion.div>
    );
  }

  const steps = [
    {
      target: ".audusd",
      content: "Clique aqui para enviar áudio.",
    },
    {
      target: ".sendmsgd",
      content:
        "Clique aqui para enviar sua mensagem de forma rápida e direta, facilitando a comunicação instantânea.",
    },
    {
      target: ".blocks",
      content:
        "Ative a proteção por senha para que uma mensagem só seja liberada para visualização quando outro usuário que saiba a senha a digitar.",
    },
    {
      target: ".audiosescri",
      content:
        "Clique aqui para gravar uma mensagem de áudio e deixar que o sistema converta automaticamente para texto, transcrevendo sua fala.",
    },
    {
      target: ".excluiuserma",
      content:
        "Com este botão, você pode excluir qualquer usuário da sala de chat com um simples clique, removendo-o imediatamente.",
    },
  ];

  const finalizeAccess = () => {
    const sanitizedUserName = sanitizeUserName(userName);
    const userRef = database.ref(
      `rooms/${roomId}/allowedUsers/${sanitizedUserName}`
    );

    userRef
      .set({
        userName,
        avatar: selectedAvatar,
        timestamp: new Date().toISOString(),
      })
      .then(() => {
        setHasJoined(true);
        setShowAvatarModal(false);
        setLoading(false);
        setStatusMessage("Você foi aceito na sala. Redirecionando...");
        setTimeout(() => {
          setStatusMessage("");
          navigate(`/room/${roomId}`);
        }, 2000);
      })
      .catch((error) => {
        console.error("Erro ao definir avatar:", error);
        setStatusMessage("Erro ao definir avatar. Tente novamente.");
        setLoading(false);
      });
  };

  const PRIMARY_COLOR = '#00f7d2'; // Um ciano/verde neon
  const BACKGROUND_COLOR = '#171721'; // Fundo bem escuro
  const CARD_COLOR = '#1f202b'; // Cor do cartão um pouco mais clara
  const ALERT_COLOR = '#ff4d4d'; // Vermelho vibrante

  // Definições de Animação para a lista
  const listContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Transição mais rápida
      },
    },
  };

  const listItemVariants = {
    hidden: { x: -30, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const computeSecurityLevel = () => {
    try {
      let score = 100; 

      if (isDestructionActive) score += 20;

      const protectedMessages = Array.isArray(messages)
        ? messages.filter((m) => m.requiresPassword).length
        : 0;
      score += Math.min(20, protectedMessages * 5);

      if (Array.isArray(allUsers) && allUsers.length > 10) score -= 10;
      if (Array.isArray(pendingRequests) && pendingRequests.length > 3) score -= 10;
      if (score >= 70) return { level: "Alto", color: "#28a745", score };
      if (score >= 45) return { level: "Médio", color: "#ffc107", score };
      return { level: "Baixo", color: "#dc3545", score };
    } catch (e) {
      return { level: "Desconhecido", color: "#6c757d", score: 0 };
    }
  };

  const security = computeSecurityLevel();

  return (
    <div>
      <Joyride
        steps={steps}
        run={isTourActive}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        scrollToFirstStep={true}
        disableScrolling={true}
        styles={{
          options: {
            zIndex: 10000,
            backgroundColor: "#fff",
            color: "white !important",
            arrowColor: "white",
          },
          buttonSkip: {
            color: "#DC143C",
          },
        }}
        locale={{
          back: "Voltar",
          close: "Fechar",
          last: "Último",
          next: "Próximo",
          skip: "Pular",
          stop: "Parar",
        }}
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setIsTourActive(false);
          }
        }}
      />

      <Helmet>
        <title>{`Bubble Safe Chat - ${roomName ? roomName : "Carregando..."
          }`}</title>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
      </Helmet>

      <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-black">
          <div class="container-fluid">
            <h1
              className="d-flex align-items-center"
              style={{
                margin: '10px 0 15px 0',
                fontSize: '1.4rem', 
                color: '#e9edef', 
                fontWeight: '600', 
                padding: '0 10px', 
              }}
            >
              <FontAwesomeIcon
                icon={faDoorOpen}
                style={{ color: '#aebac1', fontSize: '1.2em', marginRight: '8px' }}
              />
              Sala
              <span
                style={{
                  color: '#02ffc8ff',
                  fontWeight: '700',
                  marginLeft: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{roomName}</span>
                {security && (
                  <span
                    title={`Segurança: ${security.level} (${security.score})`}
                    style={{
                      background: security.color,
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}
                  >
                    {security.level}
                  </span>
                )}
              </span>
            </h1>

            <ul className="navbar-nav ms-auto mb-2 mb-md-0">
              {isCreator ? (
                <>
                  <li
                    className="nav-item me-3 position-relative"
                    ref={dropdownRef}
                  >
                    <motion.div
                      onClick={toggleDropdown}
                      className="position-relative"
                    >
                      {/* 💡 MUDANÇA AQUI: Substituí motion.img por FontAwesomeIcon */}
                      <motion.button
                        className="btn btn-link p-0 d-flex justify-content-center align-items-center"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          cursor: "pointer",
                          // Fundo sutil para destacar o ícone
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          border: `2px solid ${isDropdownOpen ? '#02ffc8ff' : 'transparent'}`, // Destaque quando aberto
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.4)",
                          color: isDropdownOpen ? '#02ffc8ff' : '#e9edef', // Cor do ícone
                          transition: 'color 0.2s, background-color 0.2s, border 0.2s'
                        }}
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize: '1.2rem' }} />
                      </motion.button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            className="dropdown-menu show position-absolute mt-2 p-2 rounded shadow"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              left: "-160px",
                              top: "100%",
                              zIndex: 2000,
                              minWidth: "220px",
                              backgroundColor: '#212529',
                            }}
                          >
                            <li className="nav-item">
                              <button
                                className="dropdown-item compart text-white d-flex align-items-center"
                                onClick={() => confirmAction("share")}
                              >
                                <FontAwesomeIcon icon={faShareAlt} className="me-2" style={{ color: '#02ffc8ff' }} />{" "}
                                Compartilhar
                              </button>
                            </li>
                            <li className="nav-item">
                              <button
                                className="dropdown-item qrcode text-white d-flex align-items-center"
                                onClick={() => confirmAction("qr")}
                              >
                                <FontAwesomeIcon icon={faQrcode} className="me-2" style={{ color: '#02ffc8ff' }} /> QR Code
                              </button>
                            </li>
                            {/* ... Outras opções (Autodestruição, Definir Senha, Excluir Chat) ... */}
                            <li className="nav-item">
                              <button
                                className={`dropdown-item d-flex justify-content-between align-items-center ${isDestructionActive ? "text-success" : "text-white"
                                  }`}
                                onClick={toggleDestruction}
                              >
                                <span className="auds d-flex align-items-center">
                                  <FontAwesomeIcon
                                    icon={faClock}
                                    className={`me-2 ${isDestructionActive ? "text-success" : "text-white"
                                      } autodesc`}
                                  />
                                  Autodestruição
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isDestructionActive}
                                  onChange={toggleDestruction}
                                  id="destructionSwitch"
                                  className="d-none"
                                />
                              </button>
                            </li>
                            <li className="nav-item">
                              <button
                                onClick={setRoomAccessPassword}
                                className="dropdown-item defpass text-white d-flex align-items-center"
                              >
                                <FontAwesomeIcon icon={faLock} className="me-2" style={{ color: '#02ffc8ff' }} /> Definir senha
                                de acesso
                              </button>
                            </li>
                            <li className="nav-item">
                              <button
                                className="dropdown-item excchat text-white d-flex align-items-center"
                                onClick={() => confirmAction("delete")}
                              >
                                <FontAwesomeIcon icon={faTrash} className="me-2 text-danger" /> Excluir Chat
                              </button>
                            </li>
                            
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </li>
                </>
              ) : (
                <li className="nav-item exitchatsd">
                  <button className="dropdown-item" onClick={leaveRoom}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Sair do Chat
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </header>

      <div className="title-container mt-3 bg-black text-start">
        <h1 className="d-flex align-items-center mb-4 mt-4"></h1>
      </div>

      {isDestructionActive && (
        <div
          className="alert alert-warning text-center alert-msg-rols"
          role="alert"
        >
          O Moderador ativou as mensagens autodestrutivas. Todas as mensagens
          serão excluídas a cada {destructionTime} segundos.
        </div>
      )}



      {isCreator && pendingRequests.length > 0 && (
        <motion.div
          className="mb-4 p-4 rounded-3"
          style={{
            backgroundColor: CARD_COLOR,
            boxShadow: `0 0 10px rgba(0, 0, 0, 0.4)`, // Sombra suave
            border: `1px solid ${CARD_COLOR}` // Borda para consistência
          }}
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Título - Mais Subtil */}
          <h5 className="text-center mb-3 pb-2" style={{
            color: PRIMARY_COLOR,
            borderBottom: `2px solid ${PRIMARY_COLOR}55`, // Linha de destaque suave
            textShadow: `0 0 5px ${PRIMARY_COLOR}55` // Efeito de brilho suave
          }}>
            <FontAwesomeIcon
              icon={faBell}
              className="me-2"
              style={{ color: ALERT_COLOR }}
            />
            SOLICITAÇÕES DE ACESSO
          </h5>

          {/* Lista de Solicitações */}
          <ul className="list-group list-unstyled">
            {pendingRequests.map((request) => (
              <motion.li
                key={request.id}
                className="d-flex justify-content-between align-items-center py-2 px-3 mb-2 rounded-2"
                style={{
                  backgroundColor: BACKGROUND_COLOR, // Contraste com o CARD_COLOR
                  color: '#EDEDED', // Cor do texto claro
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                variants={listItemVariants}
                whileHover={{
                  backgroundColor: '#2e2e40', // Fundo sutilmente mais claro no hover
                  scale: 1.01,
                }}
              >
                {/* Informação do Usuário */}
                <div className="d-flex align-items-center fw-normal">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="me-3"
                    style={{ color: PRIMARY_COLOR }}
                  />
                  <span className="fw-bold">{request.userName}</span>
                </div>

                {/* Botões de Ação */}
                <div className="d-flex gap-2">
                  {/* Botão Aceitar (Apenas Ícone) */}
                  <motion.button
                    className="btn p-0" // Remove padding do Bootstrap para controle total
                    style={{ color: PRIMARY_COLOR, border: 'none' }}
                    onClick={() => handleRequest(request.id, "accept")}
                    whileHover={{ scale: 1.2, color: '#00ffaa' }} // Brilho mais intenso
                    whileTap={{ scale: 0.9 }}
                    title="Aceitar"
                  >
                    <FontAwesomeIcon icon={faCheck} size="lg" />
                  </motion.button>

                  {/* Botão Negar (Apenas Ícone) */}
                  <motion.button
                    className="btn p-0"
                    style={{ color: ALERT_COLOR, border: 'none' }}
                    onClick={() => handleRequest(request.id, "deny")}
                    whileHover={{ scale: 1.2, color: '#ff7a7a' }} // Brilho mais intenso
                    whileTap={{ scale: 0.9 }}
                    title="Negar"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </motion.button>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      <div
        className="message-container"
        style={{
          maxHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          padding: "10px",
          backgroundColor: "transparent",
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {messages.map((msg) => {
          const handleReaction = (reactionType) => {
            if (
              msg.reactions &&
              msg.reactions[reactionType] &&
              msg.reactions[reactionType].includes(userName)
            ) {
              removeReaction(msg.id, reactionType);
            } else {
              addReaction(msg.id, reactionType);
            }
          };

          const timeSinceCreation =
            (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
          const timeRemaining = destructionTime - timeSinceCreation;
          const isSentByUser = msg.user === userName;
          const remainingTime = timeLeft[msg.id];
          const isSystemMessage = msg.user === "Sistema";

          let messageContent;
          if (isSystemMessage) {
            messageContent = msg.text;
          } else {
            if (msg.text) {
              try {
                messageContent = decryptMessage(msg.text);
              } catch (error) {
                messageContent = "Erro ao descriptografar";
              }
            }
          }

          const promptPasswordAndDisplayMessage = async () => {
            let attemptCount = 0;
            const maxAttempts = 3;

            const checkPassword = async () => {
              const { value: enteredPassword, isConfirmed, dismiss } = await Swal.fire({
                title: "Desbloquear Mensagem",
                html: `
        <div style="color: #9d9fa3; font-size: 1rem; margin-bottom: 10px;">
          Digite a senha para visualizar o conteúdo protegido.
        </div>
      `,
                input: "password",
                inputLabel: "Senha",
                inputPlaceholder: "Digite a senha (máx. 10 caracteres)",
                inputAttributes: {
                  maxlength: 10,
                  autocapitalize: "off",
                  autocorrect: "off",
                },

                // Estilos do Modal Principal
                background: '#1e2125',
                color: '#E9EDEF',
                showCancelButton: true,
                confirmButtonText: "Desbloquear",
                cancelButtonText: "Cancelar",
                focusConfirm: true,

                // Classes customizadas
                customClass: {
                  popup: 'bubble-safe-popup-decrypt',
                  title: 'bubble-safe-title',
                  input: 'bubble-safe-input',
                  confirmButton: 'bubble-safe-confirm-button',
                  cancelButton: 'bubble-safe-cancel-button',
                },

                // Aplicação de estilos após a abertura
                didOpen: (popup) => {
                  popup.style.borderRadius = '15px';
                  popup.style.border = '1px solid #17a2b8';
                  popup.style.boxShadow = '0 0 20px rgba(23, 162, 184, 0.4)';

                  const titleElement = popup.querySelector('.bubble-safe-title');
                  if (titleElement) {
                    titleElement.style.color = '#17a2b8';
                    titleElement.style.fontWeight = '700';
                    titleElement.style.fontSize = '1.5rem';
                  }

                  const inputElement = popup.querySelector('.bubble-safe-input');
                  if (inputElement) {
                    inputElement.style.backgroundColor = '#2c313a';
                    inputElement.style.color = '#E9EDEF';
                    inputElement.style.border = '2px solid #17a2b8';
                    inputElement.style.borderRadius = '8px';
                    inputElement.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.6)';
                  }

                  const confirmButton = popup.querySelector('.bubble-safe-confirm-button');
                  if (confirmButton) {
                    confirmButton.style.background = '#17a2b8';
                    confirmButton.style.color = 'white';
                    confirmButton.style.borderRadius = '8px';
                    confirmButton.style.fontWeight = 'bold';
                    confirmButton.onmouseover = () => confirmButton.style.background = '#138496';
                    confirmButton.onmouseout = () => confirmButton.style.background = '#17a2b8';
                  }

                  const cancelButton = popup.querySelector('.bubble-safe-cancel-button');
                  if (cancelButton) {
                    cancelButton.style.background = '#6c757d';
                    cancelButton.style.color = 'white';
                    cancelButton.style.borderRadius = '8px';
                    cancelButton.style.fontWeight = 'bold';
                    cancelButton.onmouseover = () => cancelButton.style.background = '#5a6268';
                    cancelButton.onmouseout = () => cancelButton.style.background = '#6c757d';
                  }
                },
              });

              if (isConfirmed && enteredPassword) {
                if (enteredPassword === msg.password) {
                  // ⭐ Modal de Sucesso (Visão) ⭐
                  Swal.fire({
                    title: "Acesso Concedido!",
                    html: `<div style="text-align: left; max-height: 200px; overflow-y: auto; padding: 10px; border: 1px solid #28a745; border-radius: 5px; background-color: #2c313a;">
                   <strong style="color: #28a745;">Mensagem:</strong><br/>${msg.text}
                 </div>`,
                    icon: "success",
                    background: '#1e2125',
                    color: '#E9EDEF',
                    confirmButtonText: "Fechar",
                    customClass: {
                      popup: 'bubble-safe-popup-success',
                      title: 'bubble-safe-title-success',
                      confirmButton: 'bubble-safe-confirm-button-success',
                    },
                    didOpen: (popup) => {
                      popup.style.borderRadius = '15px';
                      popup.style.border = '1px solid #28a745';
                      popup.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.4)';
                      const titleElement = popup.querySelector('.bubble-safe-title-success');
                      if (titleElement) titleElement.style.color = '#28a745';
                    }
                  });
                } else {
                  attemptCount++;
                  const attemptsLeft = maxAttempts - attemptCount;

                  if (attemptCount >= maxAttempts) {
                    // ⭐ Modal de Erro Crítico (Mensagem Excluída) ⭐
                    const messageRef = database.ref(
                      `rooms/${roomId}/messages/${msg.id}`
                    );
                    messageRef.remove();

                    Swal.fire({
                      title: "Mensagem Autodestruída!",
                      text: `A senha estava incorreta ${maxAttempts} vezes. A mensagem foi excluída para sua segurança.`,
                      icon: "error",
                      background: '#1e2125',
                      color: '#E9EDEF',
                      confirmButtonText: "Entendi",
                      customClass: {
                        popup: 'bubble-safe-popup-error',
                        title: 'bubble-safe-title-error',
                        confirmButton: 'bubble-safe-confirm-button-error',
                      },
                      didOpen: (popup) => {
                        popup.style.borderRadius = '15px';
                        popup.style.border = '1px solid #dc3545';
                        popup.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.4)';
                        const titleElement = popup.querySelector('.bubble-safe-title-error');
                        if (titleElement) titleElement.style.color = '#dc3545';
                      }
                    });
                  } else {
                    // ⭐ Modal de Erro Leve (Tentar Novamente) ⭐
                    Swal.fire({
                      title: "Senha Incorreta",
                      text: `Tente novamente. Você tem ${attemptsLeft} tentativa(s) restante(s).`,
                      icon: "warning",
                      background: '#1e2125',
                      color: '#E9EDEF',
                      confirmButtonText: "Tentar Novamente",
                      customClass: {
                        popup: 'bubble-safe-popup-warning',
                        title: 'bubble-safe-title-warning',
                        confirmButton: 'bubble-safe-confirm-button',
                      },
                      didOpen: (popup) => {
                        popup.style.borderRadius = '15px';
                        popup.style.border = '1px solid #ffc107';
                        popup.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.4)';
                        const titleElement = popup.querySelector('.bubble-safe-title-warning');
                        if (titleElement) titleElement.style.color = '#ffc107';
                      }
                    }).then(checkPassword); // Chama a função recursivamente para nova tentativa
                  }
                }
              }
            };
            checkPassword();
          };

          const totalReactions = msg.reactions ? Object.values(msg.reactions).flat().length : 0;

          const displayedReactions = {};
          if (msg.reactions) {
            for (const [type, users] of Object.entries(msg.reactions)) {
              if (users.length > 0) {
                const reactionItem = reactionTypes.find(r => r.type === type);
                if (reactionItem) {
                  displayedReactions[type] = {
                    icon: reactionItem.icon,
                    count: users.length,
                    reactedByMe: users.includes(userName)
                  };
                }
              }
            }
          }
          const hasVisibleReactions = Object.keys(displayedReactions).length > 0;

          const currentProgress = audioProgress[msg.id] || 0;
          const progressStyle = {
            left: `${currentProgress}%`,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isSentByUser ? '#fff' : '#02ffc8ff',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
          };

          return (
            <div key={msg.id}>
              <div
                className="message-bubble"
                style={messageStyles(isSentByUser)}
              >
                <div
                  className="d-flex align-items-center mb-1"
                  style={{
                    fontSize: "0.85em",
                    color: isSentByUser ? "#ffffffff" : "#aebac1",
                  }}
                >
                  {(messageContent || msg.requiresPassword) && (
                    <>
                      {msg.avatar ? (
                        <img
                          src={msg.avatar}
                          alt={`${msg.user}'s avatar`}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            display: "inline-block",
                            marginRight: "6px",
                          }}
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                      )}
                      <strong style={{ fontWeight: "600" }}>
                        {msg.user}
                      </strong>
                    </>
                  )}
                </div>

                {msg.replyTo && (
                  <div
                    className="reply-preview mt-2"
                    style={{
                      ...replyPreviewStyles,
                      marginBottom: '5px',
                      backgroundColor: 'rgba(2, 255, 200, 0.1)',
                      padding: '8px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #02ffc8ff',
                      marginTop: '-5px'
                    }}
                  >
                    <strong style={{ fontSize: '0.8rem', color: '#02ffc8ff' }}>
                      Respondendo a {msg.replyTo.user}
                    </strong>{" "}
                    <span style={{
                      color: '#E9EDEF',
                      display: 'block',
                      maxHeight: '30px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.9rem'
                    }}>
                      {msg.replyTo.text ? decryptMessage(msg.replyTo.text) : "Mensagem Original"}
                    </span>
                  </div>
                )}

                <div
                  className="message-content mt-2"
                  style={{
                    fontSize: "14px",
                    fontWeight: "400",
                    marginBottom: "8px",
                    color: "#e9edef",
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {msg.requiresPassword ? (
                    <button
                      onClick={promptPasswordAndDisplayMessage}
                      className="btn btn-link p-0"
                      style={{ fontSize: "12px", color: "#6fe776" }}
                    >
                      <FontAwesomeIcon icon={faLock} className="me-1" /> Mensagem Protegida (Clique
                      para digitar senha)
                    </button>
                  ) : messageContent ? (
                    messageContent
                  ) : (
                    <div
                      className="audio-message-bubble d-flex align-items-center"
                      style={{
                        backgroundColor: isSentByUser ? "#0050a7ff" : "#202c33",
                        borderRadius: "15px",
                        padding: "8px",
                        minWidth: "180px",
                        maxWidth: "100%",
                        gap: '8px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          flexShrink: 0,
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          backgroundColor: "#FF6347",
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FontAwesomeIcon icon={faMicrophoneAlt} style={{ color: '#fff', fontSize: '18px' }} />
                      </div>

                      <div className="d-flex align-items-center" style={{ flexGrow: 1, gap: '5px' }}>
                        <button
                          style={{
                            color: "#fff",
                            fontSize: "20px",
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            flexShrink: 0
                          }}
                          className="play-button"
                          // Esta é a chamada correta para a função
                          onClick={() => togglePlayPause(msg.audioUrl, msg.id)}
                          aria-label={`Play áudio da mensagem de ${msg.user}`}
                        >
                          <FontAwesomeIcon
                            icon={
                              // E a lógica de ícone continua funcionando com o estado atualizado
                              playingAudioId === msg.id ? faPauseCircle : faPlayCircle
                            }
                          />
                        </button>

                        <div
                          className="audio-waveform-container"
                          style={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            position: 'relative',
                            height: '30px',
                            minWidth: '80px'
                          }}
                        >
                          <div
                            className="audio-waveform"
                            style={{
                              width: '100%',
                              height: '10px',
                              backgroundColor: isSentByUser ? '#A1D9A7' : '#5E676C',
                              borderRadius: '5px',
                              position: 'relative',
                            }}
                          >
                            <div
                              className="audio-current-position"
                              style={progressStyle}
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className="audio-controls-footer"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          marginLeft: '8px',
                          flexShrink: 0,
                          alignSelf: 'center'
                        }}
                      >
                        <button
                          style={{
                            backgroundColor: '#1C6F6F',
                            color: '#fff',
                            fontSize: '10px',
                            padding: '2px 4px',
                            borderRadius: '10px',
                            border: 'none',
                            marginBottom: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            lineHeight: '1'
                          }}
                        >
                          1x
                        </button>
                        <small style={{ color: '#aebac1', fontSize: '10px', lineHeight: '1' }}>
                          {msg.duration || '0:08'}
                        </small>
                      </div>

                    </div>
                  )}
                </div>

                <div
                  className="message-footer d-flex justify-content-between align-items-center pt-1"
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    position: 'relative'
                  }}
                >
                  <div className="info-actions d-flex align-items-center">
                    {msg.user !== "Sistema" && (
                      <button
                        className="btn btn-link p-0 me-2"
                        onClick={() => setReplyingTo(msg)}
                        style={{
                          fontSize: "10px",
                          color: "#02ffc8ff",
                          fontWeight: 'bold',
                          textDecoration: 'none',
                        }}
                        aria-label={`Responder a mensagem de ${msg.user}`}
                      >
                        Responder
                      </button>
                    )}
                    {isDestructionActive && timeRemaining > 0 && (
                      <small style={{ color: '#ff6b6b', fontSize: '10px' }}>
                        Destrói em: {Math.max(timeRemaining.toFixed(0), 0)}s
                      </small>
                    )}
                  </div>

                  <div className="status-reactions d-flex align-items-center">
                    {msg.readBy && msg.readBy.length > 0 && (
                      <div className="msg-status me-2" style={{ lineHeight: '1' }}>
                        <FontAwesomeIcon
                          icon={faCheckDouble}
                          style={{
                            fontSize: '10px',
                            color: '#02ffc8ff',
                          }}
                          title={`Lido por: ${msg.readBy.join(", ")}`}
                        />
                      </div>
                    )}

                    <button
                      onClick={() => setMessageIdWithOpenReactions(
                        messageIdWithOpenReactions === msg.id ? null : msg.id
                      )}
                      className="btn btn-sm p-0 me-1"
                      style={{
                        backgroundColor: "transparent",
                        color: "#aebac1",
                        border: '1px solid #aebac1',
                        borderRadius: '12px',
                        fontSize: '10px',
                        lineHeight: '1',
                        minWidth: '24px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      aria-label="Adicionar reação"
                    >
                      <FontAwesomeIcon
                        icon={messageIdWithOpenReactions === msg.id ? faXmark : faSmileRegular}
                        style={{ fontSize: '0.7em' }}
                      />
                    </button>

                    {messageIdWithOpenReactions === msg.id && (
                      <div
                        className="reaction-picker-menu d-flex p-2 shadow-lg"
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 5px)',
                          right: isSentByUser ? '0' : 'unset',
                          left: isSentByUser ? 'unset' : '0',
                          backgroundColor: '#262d31',
                          borderRadius: '18px',
                          zIndex: 10,
                          minWidth: '200px',
                          justifyContent: 'space-around',
                          gap: '5px'
                        }}
                      >
                        {reactionTypes.map((reaction) => {
                          const usersReacted =
                            msg.reactions && msg.reactions[reaction.type]
                              ? msg.reactions[reaction.type]
                              : [];
                          const userHasReacted = usersReacted.includes(userName);

                          return (
                            <button
                              key={reaction.type}
                              onClick={() => {
                                handleReaction(reaction.type);
                                setMessageIdWithOpenReactions(null);
                              }}
                              className={`btn btn-link p-0 me-1`}
                              style={{
                                color: userHasReacted ? "#007bff" : "#aebac1",
                                fontSize: '1.2em',
                                transition: 'transform 0.1s',
                                position: 'relative',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                              aria-label={`Reagir com ${reaction.type}`}
                            >
                              <FontAwesomeIcon icon={reaction.icon} />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {hasVisibleReactions && (
                <div
                  className={`reactions-group ${isSentByUser ? 'justify-content-end' : 'justify-content-start'}`}
                  style={{
                    display: 'flex',
                    marginTop: '-10px',
                    marginBottom: '10px',
                    padding: '0 8px',
                    [isSentByUser ? 'marginLeft' : 'marginRight']: 'auto',
                    [isSentByUser ? 'marginRight' : 'marginLeft']: '20px',
                  }}
                >
                  <div
                    className="d-flex p-1 shadow-sm"
                    style={{
                      backgroundColor: '#202c33',
                      borderRadius: '10px',
                      border: '1px solid #333',
                      gap: '3px',
                      zIndex: 5,
                      transform: 'translateY(-50%)',
                      maxHeight: '24px'
                    }}
                  >
                    {Object.entries(displayedReactions).map(([type, reactionData]) => (
                      <div
                        key={type}
                        className="d-flex align-items-center"
                        style={{
                          cursor: 'pointer',
                          padding: '0 2px'
                        }}
                        onClick={() => handleReaction(type)}
                        aria-label={`${reactionData.count} reagiram com ${type}`}
                      >
                        <FontAwesomeIcon
                          icon={reactionData.icon}
                          style={{
                            color: reactionData.reactedByMe ? "#007bff" : "#aebac1",
                            fontSize: '0.8em',
                            marginRight: '3px'
                          }}
                        />
                        <span style={{
                          color: '#aebac1',
                          fontSize: '0.7em',
                          fontWeight: 'bold'
                        }}>
                          {reactionData.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="ms-2" style={{ fontSize: "10px" }}>
          <em>
            {typingUsers.join(", ")} {typingUsers.length > 1 ? "estão" : "está"}{" "}
            digitando...
          </em>
        </div>
      )}

      <div
        className="w-100"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1a1e23', // Fundo SÓLIDO para cobrir o chat
          boxShadow: '0 -5px 10px rgba(0, 0, 0, 0.5)',
          zIndex: 1050, // Z-index alto para a barra
          paddingTop: '10px', // Padding superior para o caso do replyingTo
        }}
      >
        {replyingTo && (
          <div
            className="replying-to p-2 mx-3 mb-2 rounded-top"
            style={{
              position: 'relative',
              backgroundColor: '#383e47',
              borderLeft: "4px solid #02ffc8ff",
              color: '#E9EDEF',
              zIndex: 1,
              width: 'auto',
              paddingRight: '30px',
            }}
          >
            {/* BOTÃO 'X' DE FECHAR: Posicionado ABSOLUTAMENTE */}
            <button
              onClick={() => setReplyingTo(null)}
              className="btn btn-link text-white= p-0"
              style={{
                position: 'absolute',
                top: '0px', // 💡 MUDANÇA: Mais perto do topo
                right: '2px', // 💡 MUDANÇA: Mais perto da borda direita (ajuste fino)
                zIndex: 10,
                color: 'transparent',
                fontSize: '0.9rem',
                lineHeight: '1',
                opacity: 0.7,
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            {/* CONTAINER DO TEXTO (Nome + Mensagem) */}
            <span
              className="d-block"
              style={{
                fontSize: '0.9rem',
                overflow: 'hidden',
                marginRight: '10px',
              }}
            >
              <strong
                style={{
                  color: '#02ffc8ff',
                  fontWeight: '700', // Um pouco mais de peso
                  fontSize: '0.85rem',
                  display: 'flex', // Usar flex para alinhar o ícone
                  alignItems: 'center',
                  gap: '5px' // Espaçamento entre ícone e texto
                }}
              >
                <FontAwesomeIcon icon={faReply} style={{ color: '#02ffc8ff', transform: 'scaleX(-1)' }} />
                Respondendo a {replyingTo.user}
              </strong>

              <span
                style={{
                  display: 'block',
                  maxHeight: '1.2em',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.2em'
                }}
              >
                {replyingTo.text}
              </span>
            </span>
          </div>
        )}

        {/* CONTAINER DO INPUT/GRAVAÇÃO: Sempre na base do container fixo */}
        <div className="d-flex align-items-center w-100 px-3 pb-2"> {/* Adiciona padding horizontal e inferior */}
          {recording ? (
            <div
              className="w-100 bg-secondary d-flex align-items-center justify-content-between px-3"
              style={{ height: "50px", borderRadius: "25px" }}
            >
              {/* ... CONTEÚDO DE GRAVAÇÃO ... */}
              <FontAwesomeIcon icon={faPlus} className="text-white me-3" style={{ opacity: 0.5, fontSize: "1.5rem" }} />
              <span className="text-white flex-grow-1 text-center fw-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Gravando...
              </span>
              <div className="d-flex align-items-center flex-shrink-0">
                <button
                  onClick={stopRecording}
                  className="btn btn-link text-white p-0 me-3"
                  style={{ fontSize: "1.5rem" }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
                <button
                  disabled
                  className="btn btn-link text-white p-0"
                  style={{ fontSize: "1.5rem", opacity: 0.5 }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
            </div>
          ) : audioFile ? (
            <div
              className="w-100 bg-secondary d-flex align-items-center justify-content-between px-3"
              style={{ height: "50px", borderRadius: "25px" }}
            >
              {/* ... CONTEÚDO DE AUDIO ... */}
              <audio
                controls
                src={URL.createObjectURL(audioFile)}
                className="flex-grow-1 me-2"
                style={{
                  height: "30px",
                  filter: 'invert(1)',
                  maxWidth: 'calc(100% - 100px)'
                }}
              />
              <div className="d-flex align-items-center flex-shrink-0">
                <button
                  onClick={() => setAudioFile(null)}
                  className="btn btn-link text-white p-0 me-3"
                  style={{ fontSize: "1.5rem" }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
                <button
                  onClick={sendAudioMessage}
                  disabled={!audioFile}
                  className="btn btn-link text-white p-0"
                  style={{ fontSize: "1.5rem" }}
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center w-100 position-relative">
              {showOptions && (
                <div
                  className="position-absolute shadow-lg rounded-3 bg-dark text-white p-2"
                  style={{
                    bottom: "calc(100% + 10px)",
                    left: "0px",
                    right: "unset",
                    transform: "unset",
                    minWidth: "250px",
                    zIndex: 100,
                  }}
                >
                  <button
                    className="d-flex align-items-center w-100 btn text-white text-start py-2"
                    onClick={() => {
                      Swal.fire({
                        title: "Mensagem Protegida",
                        text: "Este botão envia uma mensagem protegida.",
                        icon: "info",
                        confirmButtonText: "OK",
                      }).then(() => {
                        sendProtectedMessage();
                        toggleOptions();
                      });
                    }}
                    style={{ borderRadius: "5px", transition: "background-color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#343a40')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <FontAwesomeIcon icon={faLock} className="me-3" style={{ fontSize: '1.2rem' }} />
                    Mensagem Protegida
                  </button>

                  <button
                    className="d-flex align-items-center w-100 btn text-white text-start py-2"
                    onClick={() => {
                      const action = recognitionActive ? stopRecognition : startRecognition;
                      const text = recognitionActive ? "Parando o reconhecimento de voz" : "Iniciando o reconhecimento de voz";
                      Swal.fire({
                        title: "Reconhecimento de Voz",
                        text: text,
                        icon: "info",
                        confirmButtonText: "OK",
                      }).then(() => {
                        action();
                        toggleOptions();
                      });
                    }}
                    style={{ borderRadius: "5px", transition: "background-color 0.2s" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#343a40')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <FontAwesomeIcon icon={faMicrophoneAlt} className="me-3" style={{ fontSize: '1.2rem' }} />
                    Reconhecimento de Voz
                  </button>

                  {isCreator && (
                    <button
                      className="d-flex align-items-center w-100 btn text-white text-start py-2"
                      onClick={() => {
                        Swal.fire({
                          title: "Expulsar Usuário",
                          text: "Você está prestes a expulsar um usuário da sala.",
                          icon: "warning",
                          confirmButtonText: "OK",
                        }).then(() => {
                          toggleExpelModal();
                          toggleOptions();
                        });
                      }}
                      style={{ borderRadius: "5px", transition: "background-color 0.2s" }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#343a40')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FontAwesomeIcon icon={faUserSlash} className="me-3" style={{ width: "1rem" }} />
                      Expulsar Usuário
                    </button>
                  )}
                  <div className="dropdown-divider bg-secondary my-2"></div>
                </div>
              )}

              <div className="d-flex align-items-center me-2">
                <button
                  ref={buttonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOptions();
                  }}
                  className="btn btn-secondary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
                  style={{
                    width: "40px",
                    height: "40px",
                    padding: 0,
                    backgroundColor: "#495057",
                    borderColor: "#495057",
                  }}
                >
                  <FontAwesomeIcon icon={showOptions ? faTimes : faPlus} />
                </button>
              </div>

              <div className="input-with-icon w-100 position-relative me-2">
                <input
                  type="text"
                  value={message}
                  onChange={handleTyping}
                  placeholder="Digite alguma coisa"
                  onFocus={markAllMessagesAsRead}
                  className="form-control msg-user1 pe-5 bg-dark text-white border-secondary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  style={{ height: "50px", borderRadius: "25px" }}
                />
                <button
                  onClick={startRecording}
                  disabled={recording}
                  className="btn-icon audusd border-0 p-0"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "40%",
                    transform: "translateY(-50%)",
                    color: "#007bff",
                    background: "transparent",
                    zIndex: 10,
                  }}
                >
                  <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: "1.2rem" }} />
                </button>
              </div>

              {/* Botão de Envio (seta) */}
              {message.trim() ? (
                <div className="d-flex align-items-center flex-shrink-0">
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="btn btn-primary rounded-circle shadow-sm d-flex justify-content-center align-items-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      padding: 0,
                      backgroundColor: "#007bff",
                      borderColor: "#007bff",
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      {isCreator && (
        <div>
          <p className="d-none">
            Link: <a href={shareLink}>{shareLink}</a>
          </p>
        </div>
      )}

      {showExpelModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)", // Fundo mais escuro
            backdropFilter: "blur(5px)", // Efeito de desfoque moderno
          }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div
              className="modal-content"
              style={{
                backgroundColor: "#1e2125", // Darker background
                border: "1px solid #17a2b8", // Borda ciano sutil
                borderRadius: "15px", // Bordas mais arredondadas
                boxShadow: "0 0 25px rgba(23, 162, 184, 0.3)", // Sombra ciano
              }}
            >
              <div
                className="modal-header"
                style={{
                  borderBottom: "1px solid #333", // Divisor sutil
                  padding: "15px 20px",
                  color: "#fff",
                }}
              >
                <h5 className="modal-title d-flex align-items-center fw-bold">
                  <FontAwesomeIcon
                    icon={faUserSlash}
                    className="me-2"
                    style={{ color: "#dc3545" }} // Ícone vermelho para ação perigosa
                  />
                  Gerenciamento de Expulsão
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={toggleExpelModal}
                  style={{ filter: "invert(1)", opacity: 0.8 }} // Ícone X branco
                ></button>
              </div>

              <div className="modal-body" style={{ padding: "20px" }}>
                {/* Seletor de Usuário e Botão de Expulsar Individual */}
                <div className="d-flex align-items-center mb-3">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="form-select me-2"
                    style={{
                      backgroundColor: "#2c313a",
                      color: "#e9edef",
                      border: "2px solid #17a2b8", // Borda ciano
                      borderRadius: "8px",
                      height: "45px",
                      transition: "border-color 0.3s",
                    }}
                  >
                    <option value="">Selecione um usuário para expulsar</option>
                    {allUsers.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn"
                    onClick={() => {
                      expelUser(selectedUser);
                      toggleExpelModal();
                    }}
                    disabled={!selectedUser}
                    style={{
                      backgroundColor: "#dc3545", // Vermelho forte
                      color: "#fff",
                      fontWeight: "bold",
                      border: "none",
                      borderRadius: "8px",
                      minWidth: "45px",
                      height: "45px",
                      transition: "background-color 0.3s ease, transform 0.2s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>

                <hr style={{ borderColor: '#333' }} />

                {/* Botão de Expulsar Todos os Usuários */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-lg"
                    onClick={expelAllUsers}
                    style={{
                      backgroundColor: "#7e1a24", // Vermelho escuro, indicando perigo
                      color: "#fff",
                      fontWeight: "bold",
                      border: "2px solid #dc3545", // Borda vermelha
                      borderRadius: "8px",
                      padding: "10px 0",
                      fontSize: "1rem",
                      transition: "background-color 0.3s ease, transform 0.2s ease",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#7e1a24")}
                  >
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    EXPULSAR TODOS OS USUÁRIOS
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className="alert alert-success d-flex align-items-center"
          role="alert"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
          <span>{statusMessage}</span>
        </div>
      )}

      {showAvatarModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content bg-dark">
              <div className="modal-header">
                <h5 className="modal-title">Escolha seu Avatar</h5>
                <button
                  type="button"
                  className="btn-close text-bg-light"
                  aria-label="Close"
                  onClick={() => setShowAvatarModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex flex-wrap justify-content-center">
                  {avatars.map((avatarUrl, index) => (
                    <img
                      key={index}
                      src={avatarUrl}
                      alt={`Avatar ${index + 1}`}
                      className={`avatar-option ${selectedAvatar === avatarUrl ? "selected" : ""
                        }`}
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        margin: "10px",
                        cursor: "pointer",
                        border:
                          selectedAvatar === avatarUrl
                            ? "3px solid #007bff"
                            : "2px solid #ccc",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (selectedAvatar) {
                      finalizeAccess();
                    } else {
                      Swal.fire(
                        "Seleção de Avatar",
                        "Por favor, selecione um avatar.",
                        "warning"
                      );
                    }
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
