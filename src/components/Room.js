import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database, auth, storage } from '../firebaseConfig';
import { QRCodeCanvas } from 'qrcode.react';
import './Room.css';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis, faPlus, faUserSecret, faBell, faLock, faPen, faUserSlash, faPauseCircle, faDoorOpen, faSignInAlt, faUser, faClock, faSignOutAlt, faUserCircle, faPaperPlane, faMicrophone, faCheckCircle, faStopCircle, faTrashAlt, faPlayCircle, faClipboard, faQrcode, faShareAlt, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { Helmet } from 'react-helmet';
import iconPage from './img/icon-menu.png'
import { motion } from 'framer-motion';
import { Spinner } from "react-bootstrap";
import notificationSound from './sounds/notification.mp3';
import Joyride from 'react-joyride';

const Room = () => {
  const { roomId } = useParams();
  const [userName, setUserName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isRoomLoaded, setIsRoomLoaded] = useState(false);
  const [roomName, setRoomName] = useState('');
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
  const [shareMethod, setShareMethod] = useState('');
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
  const [selectedUser, setSelectedUser] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showPlusButton, setShowPlusButton] = useState(false);
  const [showExpelModal, setShowExpelModal] = useState(false);
  const toggleExpelModal = () => setShowExpelModal(!showExpelModal);
  const [isReloading, setIsReloading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const previousMessageCount = useRef(0);
  const [roomPassword, setRoomPassword] = useState('');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isRotated, setIsRotated] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

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
        deletionTime: isDestructionActive ? Date.now() + destructionTime * 1000 : null,
      };

      messageRef.set(newMessage);
      setMessage('');
      setReplyingTo(null);
    }
  };

  const handleToggle = () => {
    setIsRotated(!isRotated);
  };

  const startNewRoom = () => {
    localStorage.removeItem('tourAsked');
  };

  const promptPasswordAndDisplayMessage = (msg) => {
    let attemptCount = 0;

    const checkPassword = async () => {
      const { value: enteredPassword } = await Swal.fire({
        title: 'Digite a senha para ver a mensagem',
        input: 'password',
        inputLabel: 'Senha',
        inputPlaceholder: 'Digite a senha',
        inputAttributes: {
          maxlength: 10,
          autocapitalize: 'off',
          autocorrect: 'off'
        },
        showCancelButton: true,
      });

      if (enteredPassword) {
        if (enteredPassword === msg.password) {
          Swal.fire('Correto!', 'Aqui está sua mensagem: ' + msg.text, 'success');
        } else {
          attemptCount++;

          if (attemptCount >= 3) {
            const messageRef = database.ref(`rooms/${roomId}/messages/${msg.id}`);
            messageRef.remove();
            Swal.fire('Erro!', 'A senha estava incorreta 3 vezes. A mensagem foi excluída.', 'error');
          } else {
            Swal.fire('Erro!', 'Senha incorreta. Tente novamente.', 'error').then(checkPassword);
          }
        }
      }
    };

    checkPassword();
  };

  const sendProtectedMessage = () => {
    Swal.fire({
      title: 'Digite uma senha para proteger a mensagem',
      input: 'password',
      inputLabel: 'Senha',
      inputPlaceholder: 'Digite uma senha',
      inputAttributes: {
        maxlength: 10,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar',
    }).then((result) => {
      if (result.value) {
        sendMessageWithPassword(result.value);
      }
    });
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
    setShowPlusButton(!showOptions);
  };

  const startRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setRecognitionActive(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage((prevMessage) => prevMessage + ' ' + transcript);
    };

    recognition.onend = () => {
      setRecognitionActive(false);
    };

    recognition.onerror = (event) => {
      console.error('Erro no reconhecimento de voz:', event.error);
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
    return userName.replace(/[.#$[\]]/g, '_');
  };

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    const allowedRef = roomRef.child('allowedUsers');

    const currentUser = auth.currentUser;

    if (currentUser) {
      const sanitizedUserName = sanitizeUserName2(currentUser.displayName || currentUser.email);
      allowedRef.child(sanitizedUserName).once('value', (snapshot) => {
        if (snapshot.exists()) {
          setHasJoined(true);
        }
      });
    } else {
      console.warn("Usuário não autenticado. currentUser é null.");
    }

    roomRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        setRoomName(roomData.name);
        setCreatorName(roomData.creatorName || 'Moderador');
        setCreatorAvatar(roomData.avatar || null);

        if (currentUser && roomData.creator === currentUser.uid) {
          setIsCreator(true);
          setUserName(roomData.creatorName || 'Moderador');

          localStorage.setItem('isCreator', 'true');
          localStorage.setItem('userName', roomData.creatorName || 'Moderador');
        } else if (currentUser) {
          const sanitizedUserName = sanitizeUserName2(currentUser.displayName || currentUser.email);
          localStorage.setItem('isCreator', 'false');
          localStorage.setItem('userName', sanitizedUserName || 'Usuário');
        }
      }
      setIsRoomLoaded(true);
    });
  }, [roomId]);

  useEffect(() => {
    const storedIsCreator = localStorage.getItem('isCreator') === 'true';
    const storedUserName = localStorage.getItem('userName');
    const storedCreatorName = localStorage.getItem('creatorName');

    if (storedUserName) {
      setIsCreator(storedIsCreator);
      setUserName(storedUserName);
      setCreatorName(storedCreatorName || 'Moderador');
    }
  }, []);

  useEffect(() => {
    const allowedUsersRef = database.ref(`rooms/${roomId}/allowedUsers`);
    const expelledUsersRef = database.ref(`rooms/${roomId}/expelledUsers`);

    allowedUsersRef.on('value', (snapshot) => {
      const usersData = snapshot.val() || {};
      const allowedUsers = Object.keys(usersData);

      expelledUsersRef.once('value', (expelledSnapshot) => {
        const expelledData = expelledSnapshot.val() || {};
        const expelledUsers = Object.keys(expelledData);

        const filteredUsers = allowedUsers.filter(user => !expelledUsers.includes(user));
        setAllUsers(filteredUsers);
      });
    });

    return () => {
      allowedUsersRef.off();
    };
  }, [roomId]);

  const expelAllUsers = () => {
    const allowedUsersRef = database.ref(`rooms/${roomId}/allowedUsers`);
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers`);

    allowedUsersRef.once('value', (snapshot) => {
      const users = snapshot.val();
      if (users) {
        const expelPromises = Object.keys(users).map((userName) => {
          return expelledRef.child(userName).set(true).then(() => {
            allowedUsersRef.child(userName).remove();
            return database.ref(`rooms/${roomId}/messages`).push({
              text: `${userName} foi expulso da sala.`,
              user: 'Sistema',
              timestamp: new Date().toISOString(),
            });
          });
        });

        Promise.all(expelPromises)
          .then(() => Swal.fire('Sucesso!', 'Todos os usuários foram expulsos.', 'success'))
          .catch((error) => console.error('Erro ao expulsar usuários:', error));
      }
    });
  };

  const handleUserSelect = (e) => {
    setSelectedUser(e.target.value);
  };

  const setRoomAccessPassword = async () => {
    const { value: password } = await Swal.fire({
      title: 'Definir senha para acesso à sala',
      input: 'password',
      inputLabel: 'Senha',
      inputPlaceholder: 'Digite uma senha para a sala',
      inputAttributes: {
        maxlength: 10,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Definir',
    });

    if (password) {
      setRoomPassword(password);
      setIsPasswordEnabled(true);

      database.ref(`rooms/${roomId}`).update({
        roomPassword: password,
        isPasswordEnabled: true,
      });

      Swal.fire('Senha definida!', 'A senha foi configurada para a sala.', 'success');
    }
  };

  const verifyRoomPassword = async () => {
    const snapshot = await database.ref(`rooms/${roomId}`).once('value');
    const roomData = snapshot.val();

    if (roomData && roomData.isPasswordEnabled && roomData.roomPassword) {
      let attemptCount = 0;

      while (attemptCount < 3) {
        const { value: enteredPassword } = await Swal.fire({
          title: 'Digite a senha para acessar a sala',
          input: 'password',
          inputLabel: 'Senha',
          inputPlaceholder: 'Digite a senha de acesso',
          inputAttributes: {
            maxlength: 10,
            autocapitalize: 'off',
            autocorrect: 'off'
          },
          showCancelButton: true,
        });

        if (enteredPassword === roomData.roomPassword) {
          return true;
        } else {
          attemptCount++;
          setAttempts(attemptCount);
          if (attemptCount >= 3) {
            Swal.fire('Acesso bloqueado', 'Você excedeu o número de tentativas.', 'error');
            navigate('/'); // Redireciona após 3 tentativas incorretas
            return false;
          } else {
            Swal.fire('Senha incorreta', `Você tem ${3 - attemptCount} tentativa(s) restante(s).`, 'error');
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
        navigate('/');
      }
    };

    if (!isCreator && !hasJoined) {
      checkAccess();
    }
  }, [isCreator, hasJoined, roomId, navigate]);

  useEffect(() => {
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers`);
    expelledRef.on('value', (snapshot) => {
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
          user: 'Sistema',
          timestamp: new Date().toISOString(),
        });
      }
    };

    const beforeUnloadHandler = (event) => {
      setIsReloading(true);
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    window.addEventListener('unload', handleUserExit);

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      window.removeEventListener('unload', handleUserExit);
    };
  }, [userName, roomId, isCreator, isReloading]);

  useEffect(() => {
    setIsReloading(false);
  }, []);

  const playNotificationSound = () => {
    const audio = new Audio(notificationSound);
    audio.play().catch((error) => console.error('Erro ao reproduzir áudio:', error));
  };

  useEffect(() => {
    const handleUserInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };

    window.addEventListener('click', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    const messagesRef = database.ref(`rooms/${roomId}/messages`);
    messagesRef.on('value', (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const parsedMessages = Object.entries(messagesData).map(([key, value]) => ({
          id: key,
          ...value,
        }));
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
      const messageContainer = document.querySelector('.message-container');
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      const messageContainer = document.querySelector('.message-container');
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    const handleFocus = () => setIsKeyboardVisible(true);
    const handleBlur = () => setIsKeyboardVisible(false);

    const inputElement = inputRef.current;

    if (inputElement) {
      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  useEffect(() => {
    const messageContainer = messageContainerRef.current;
    if (messageContainer) {
      if (isKeyboardVisible) {
        messageContainer.style.height = 'calc(100vh - 250px)';
      } else {
        messageContainer.style.height = 'calc(100vh - 60px)';
      }
    }
  }, [isKeyboardVisible]);

  const markMessageAsRead = (messageId) => {
    const readByRef = database.ref(`rooms/${roomId}/messages/${messageId}/readBy`);
    readByRef.once('value', (snapshot) => {
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
        const timeSinceCreation = (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
        if (timeSinceCreation >= destructionTime) {
          const messageRef = database.ref(`rooms/${roomId}/messages/${msg.id}`);
          messageRef.once('value', (snapshot) => {
            const messageData = snapshot.val();
            if (messageData && messageData.audioUrl) {
              const audioRef = storage.refFromURL(messageData.audioUrl);
              audioRef.delete().catch((error) => {
                console.error('Erro ao deletar áudio:', error);
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
    typingRef.on('value', (snapshot) => {
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
      requestsRef.on('value', (snapshot) => {
        const requestsData = snapshot.val();
        if (requestsData) {
          const parsedRequests = Object.entries(requestsData).map(([key, value]) => ({
            id: key,
            ...value,
          }));
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

    if (decision === 'accept') {
      requestRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const allowedRef = database.ref(`rooms/${roomId}/allowedUsers/${userData.userName}`);
          allowedRef.set(true).then(() => {
            database.ref(`rooms/${roomId}/messages`).push({
              text: `${userData.userName} foi autorizado a entrar na sala.`,
              user: 'Sistema',
              timestamp: new Date().toISOString(),
            });
            setUsersWithExpelButton((prevUsers) => new Set([...prevUsers, userData.userName]));
            setLoading(false);
          });
        }
      });
    } else if (decision === 'deny') {
      requestRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const denyRef = database.ref(`rooms/${roomId}/deniedRequests/${userData.userName}`);
          denyRef.set({
            message: `Sua solicitação foi recusada.`,
            timestamp: new Date().toISOString(),
          }).then(() => {
            Swal.fire({
              icon: 'error',
              title: 'Solicitação Recusada',
              text: `A solicitação de ${userData.userName} foi recusada com sucesso.`,
              confirmButtonText: 'OK',
            });
            setLoading(false);
          });
        }
      });
    }

    requestRef.remove()
      .then(() => {
        setPendingRequests((prevRequests) => prevRequests.filter((req) => req.id !== userId));
      })
      .catch((error) => {
        console.error('Erro ao processar a solicitação:', error);
      });
  };

  const requestAccess = () => {
    if (!userName.trim()) {
      setStatusMessage('Nome de usuário é obrigatório.');
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
        setStatusMessage('Solicitação de entrada enviada. Aguarde aprovação.',);
      })
      .catch((error) => {
        console.log('Erro ao enviar solicitação:', error);
        setStatusMessage('Erro ao enviar solicitação. Tente novamente.');
      });
  };

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', (snapshot) => {
      const roomData = snapshot.val();

      if (roomData && roomData.isClosed) {
        Swal.fire({
          title: 'Sala Encerrada',
          text: 'A sala foi encerrada pelo criador. Redirecionando...',
          icon: 'info',
          confirmButtonText: 'Ok'
        }).then(() => {
          navigate('/');
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
    const storedUserName = localStorage.getItem('userName');

    if (storedRoomAccess === 'true' && storedUserName === userName) {
      setHasJoined(true);
    }

    if (!hasRequestedAccess && storedRoomAccess !== 'true') return;
    const allowedRef = database.ref(`rooms/${roomId}/allowedUsers/${userName}`);
    const deniedRef = database.ref(`rooms/${roomId}/deniedRequests/${userName}`);
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers/${userName}`);

    expelledRef.on('value', (snapshot) => {
      if (snapshot.exists() && !isCreator) {
        Swal.fire({
          icon: 'error',
          title: 'Acesso Negado',
          text: 'Você foi expulso da sala e não pode solicitar acesso novamente.',
          confirmButtonText: 'Ok',
        }).then(() => {
          navigate('/login');
        });
      }
    });

    allowedRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        setHasJoined(true);
        localStorage.setItem(`hasJoined_${roomId}`, 'true');
        localStorage.setItem('userName', userName);

        setStatusMessage('Você foi aceito na sala. Redirecionando...');

        setTimeout(() => {
          setStatusMessage('');
          navigate(`/room/${roomId}`);
        }, 2000);
      }
    });

    deniedRef.on('value', (snapshot) => {
      if (snapshot.exists() && !isCreator) {
        Swal.fire({
          icon: 'error',
          title: 'Solicitação Recusada',
          text: 'Sua solicitação de acesso foi recusada. Redirecionando...',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          willClose: () => {
            navigate('/');
          }
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
    return userName.replace(/[.#$[\]]/g, '_');
  };

  const expelUser = (userName) => {
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers/${userName}`);
    expelledRef.set(true).then(() => {
      database.ref(`rooms/${roomId}/messages`).push({
        text: `${userName} foi expulso da sala.`,
        user: 'Sistema',
        timestamp: new Date().toISOString(),
      });

      setAllUsers((prevUsers) => prevUsers.filter(user => user !== userName));
      setSelectedUser('');
    }).catch((error) => {
      console.error('Erro ao expulsar usuário:', error);
    });
  };

  const sendMessage = () => {
    if (message.trim()) {
      const deletionTime = Date.now() + destructionTime * 1000;
      const messageRef = database.ref(`rooms/${roomId}/messages`).push();

      const newMessage = {
        text: message,
        user: userName || creatorName,
        timestamp: new Date().toISOString(),
        deletionTime: isDestructionActive ? deletionTime : null,
      };

      if (replyingTo) {
        newMessage.replyTo = {
          id: replyingTo.id,
          user: replyingTo.user,
          text: replyingTo.text,
        };
      }

      messageRef.set({
        text: message,
        user: userName || creatorName,
        timestamp: new Date().toISOString(),
        deletionTime: isDestructionActive ? deletionTime : null,
      });

      messageRef.set(newMessage);
      setMessage('');
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
    messageRef.set({
      text: `${userName} saiu da sala.`,
      user: 'Sistema',
      timestamp: new Date().toISOString(),
    }).then(() => {
      setStatusMessage('Você saiu da sala.');
      setTimeout(() => {
        localStorage.removeItem('hasJoined');
        navigate('/');
      }, 1000);
    }).catch((error) => {
      console.error('Erro ao enviar mensagem de saída:', error);
    });
  };

  const deleteChat = async () => {
    try {
      await database.ref(`rooms/${roomId}`).update({
        isClosed: true,
      });

      await database.ref(`rooms/${roomId}/messages`).push({
        text: `A sala foi encerrada pelo moderador.`,
        user: 'Sistema',
        timestamp: new Date().toISOString(),
      });

      const messagesSnapshot = await database.ref(`rooms/${roomId}/messages`).once('value');
      const messages = messagesSnapshot.val();

      if (messages) {
        const deletePromises = Object.keys(messages).map(async (msgId) => {
          const msg = messages[msgId];

          if (msg.audioUrl) {
            const audioRef = storage.refFromURL(msg.audioUrl);
            try {
              await audioRef.delete();
              console.log(`Arquivo de áudio ${msg.audioUrl} deletado com sucesso.`);
            } catch (error) {
              console.error(`Erro ao deletar o arquivo de áudio ${msg.audioUrl}:`, error);
            }
          }
          await database.ref(`rooms/${roomId}/messages/${msgId}`).remove();
        });

        await Promise.all(deletePromises);
      }
      await database.ref(`rooms/${roomId}`).remove();
      let timerInterval;

      setHasJoined(false);
      setUserName('');
      Swal.fire({
        title: 'Excluindo sala arquivos e mensagens!!',
        icon: 'info',
        html: 'Irei fechar em <b></b> milissegundos.',
        timer: 1300,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const timer = Swal.getPopup().querySelector('b');
          timerInterval = setInterval(() => {
            timer.textContent = Swal.getTimerLeft();
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then(() => {
        setTimeout(() => {
          navigate('/');
        }, 100);
        Swal.fire({
          title: 'Sucesso!',
          text: 'Sala e arquivos e mensagens excluídos com sucesso!',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      });
    } catch (error) {
      console.error('Erro ao excluir a sala e arquivos:', error);
      setStatusMessage('Erro ao excluir a sala. Tente novamente.');
    }
  };

  const toggleDestruction = async () => {
    if (!isDestructionActive) {
      const { value: destructionTime } = await Swal.fire({
        title: 'Escolha o tempo de destruição (segundos)',
        input: 'number',
        inputAttributes: {
          min: 1,
          max: 300,
        },
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'Você deve inserir um número!';
          }
          if (value < 1 || value > 300) {
            return 'O tempo deve ser entre 1 e 300 segundos!';
          }
        }
      });

      if (destructionTime) {
        setDestructionTime(destructionTime);
        setIsDestructionActive(true);

        database.ref(`rooms/${roomId}`).update({
          isDestructionActive: true,
          destructionTime,
        });

        database.ref(`rooms/${roomId}/messages`).push({
          text: 'O Moderador ativou as mensagens autodestrutivas.',
          user: 'Sistema',
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      setIsDestructionActive(false);

      database.ref(`rooms/${roomId}`).update({
        isDestructionActive: false,
      });

      database.ref(`rooms/${roomId}/messages`).push({
        text: 'O Moderador desativou as mensagens autodestrutivas.',
        user: 'Sistema',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        streamRef.current = stream;
        setRecording(true);

        mediaRecorder.ondataavailable = (event) => {
          const audioBlob = new Blob([event.data], { type: 'audio/mp3' });
          setAudioFile(audioBlob);
        };

        mediaRecorder.start();
      })
      .catch((error) => {
        console.error('Erro ao acessar o microfone:', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecording(false);
    }
  };

  const sendAudioMessage = () => {
    if (audioFile) {
      const storageRef = storage.ref();
      const audioRef = storageRef.child(`rooms/${roomId}/audio_${Date.now()}.mp3`);
      const uploadTask = audioRef.put(audioFile);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error('Erro ao enviar áudio:', error);
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

  const playAudio = (audioUrl, messageId) => {
    const audio = new Audio(audioUrl);

    if (playingAudioId !== null && playingAudioId !== messageId) {
      setPlayingAudioId(null);
    }

    audio.play();
    setPlayingAudioId(messageId);

    audio.onended = () => {
      setPlayingAudioId(null);
    };

    audio.onpause = () => {
      setPlayingAudioId(null);
    };
  };

  const togglePlayPause = (audioUrl, messageId) => {
    if (playingAudioId === messageId) {
      setPlayingAudioId(null);
    } else {
      playAudio(audioUrl, messageId);
    }
  };

  const showShareModal = () => {
    const content = (
      <div>
        <div className="mb-3">
          <button id="copyLink" className="btn btn-primary w-100 mb-2">
            <FontAwesomeIcon icon={faClipboard} className="me-2" /> Copiar Link
          </button>
          <button id="emailLink" className="btn btn-primary w-100 mb-2">
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" /> Enviar por E-mail
          </button>
          <button id="whatsappLink" className="btn btn-primary w-100 mb-2">
            <FontAwesomeIcon icon={faWhatsapp} className="me-2" /> Compartilhar no WhatsApp
          </button>
          <button id="telegramLink" className="btn btn-primary w-100">
            <FontAwesomeIcon icon={faTelegram} className="me-2" /> Compartilhar no Telegram
          </button>
        </div>
      </div>
    );

    const contentString = ReactDOMServer.renderToString(content);

    Swal.fire({
      title: 'Escolha uma opção para compartilhar',
      html: contentString,
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false,
      didOpen: () => {
        document.getElementById('copyLink').addEventListener('click', () => {
          navigator.clipboard.writeText(shareLink2)
            .then(() => {
              Swal.fire({
                title: 'Sucesso!',
                text: 'Link copiado para a área de transferência!',
                icon: 'success',
                confirmButtonText: 'Ok'
              });
            })
            .catch(err => { console.error('Erro ao copiar: ', err); });
          Swal.close();
        });

        document.getElementById('emailLink').addEventListener('click', () => {
          window.open(`mailto:?subject=Compartilhe este link&body=Confira este link do chat: ${shareLink2}`, '_blank', 'noopener,noreferrer');
          Swal.close();
        });

        document.getElementById('whatsappLink').addEventListener('click', () => {
          window.open(`https://api.whatsapp.com/send?text=Confira este link do chat: ${shareLink2}`, '_blank', 'noopener,noreferrer');
          Swal.close();
        });

        document.getElementById('telegramLink').addEventListener('click', () => {
          window.open(`https://t.me/share/url?url=${shareLink2}`, '_blank', 'noopener,noreferrer');
          Swal.close();
        });
      },
    });
  };

  const confirmAction = (actionType) => {
    switch (actionType) {
      case 'share':
        showShareModal();
        break;
      case 'delete':
        Swal.fire({
          title: 'Excluir Chat',
          text: 'Você tem certeza que deseja excluir o chat? Esta ação não pode ser desfeita.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Não',
        }).then((result) => {
          if (result.isConfirmed) {
            deleteChat();
          }
        });
        break;
      case 'qr':
        showQRCode();
        break;
      default:
        return;
    }
  };

  const messageStyles = (isSentByUser) => ({
    padding: '4px',
    borderRadius: '15px',
    margin: isSentByUser ? '10px 0 5px auto' : '10px auto 5px 0',
    backgroundColor: isSentByUser ? '#d6eaff' : '#f1f1f1',
    maxWidth: '90%',
    textAlign: isSentByUser ? 'right' : 'left',
    position: 'relative',
    color: '#000',
  });

  const replyPreviewStyles = {
    fontSize: '12px',
    borderLeft: '2px solid #007bff',
    paddingLeft: '10px',
    marginBottom: '5px',
  };

  const QRCodeModal = ({ shareLink }) => (
    <div style={{
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '100%',
      padding: '10px'
    }}>
      <QRCodeCanvas
        value={shareLink}
        size={Math.min(window.innerWidth * 0.8, 190)}
        style={{
          borderRadius: '10px',
          overflow: 'hidden',
          width: '100%',
          height: 'auto'
        }}
      />
      <p className="d-none">Link: {shareLink}</p>
    </div>
  );

  const showQRCode = () => {
    const modalContent = document.createElement('div');
    ReactDOM.render(<QRCodeModal shareLink={shareLink2} />, modalContent);

    Swal.fire({
      title: 'QR Code',
      html: modalContent,
      showCloseButton: true,
      showCancelButton: false,
      showConfirmButton: false,
    });
  };

  if (!hasJoined && !isCreator) {
    return (
      <div className="container mt-5 d-flex justify-content-center mb-5">
        <motion.div
          className="card p-4 shadow bg-dark text-light mt-5 mb-5"
          style={{ width: '100%', maxWidth: '800px' }}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            className="col-md-4 col-lg-4 col-xl-4 mx-auto mb-4 img-fluid"
            style={{ maxWidth: '280px' }}
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
            <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: '#F1E5AC' }} />
            Insira seu nome ou nick para solicitação de acesso à sala
          </motion.p>
          <div className="d-flex justify-content-center">
            <motion.input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome ou nick"
              className="form-control"
              style={{ maxWidth: '100%', width: '100%', borderRadius: "10rem" }}
              autoFocus
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            />
            {userName.trim() && (
              <motion.button
                onClick={requestAccess}
                disabled={!userName.trim() || loading}
                className="btn btn-primary ms-2"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ borderRadius: "10rem" }}
              >
                <FontAwesomeIcon icon={faSignInAlt} />
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
              <div className="spinner-border colorful-spinner" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
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
        <div className="mt-3">Carregando a sala...</div>
      </motion.div>
    );
  }

  const steps = [
    {
      target: '.audusd',
      content: 'Clique aqui para enviar áudio.',
    },
    {
      target: '.sendmsgd',
      content: 'Clique aqui para enviar sua mensagem de forma rápida e direta, facilitando a comunicação instantânea.',
    },
    {
      target: '.blocks',
      content: 'Ative a proteção por senha para que uma mensagem só seja liberada para visualização quando outro usuário que saiba a senha a digitar.',
    },
    {
      target: '.audiosescri',
      content: 'Clique aqui para gravar uma mensagem de áudio e deixar que o sistema converta automaticamente para texto, transcrevendo sua fala.',
    },
    {
      target: '.excluiuserma',
      content: 'Com este botão, você pode excluir qualquer usuário da sala de chat com um simples clique, removendo-o imediatamente.',
    },
  ];

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
            backgroundColor: '#fff',
            color: 'white !important',
            arrowColor: 'white',
          },
          buttonSkip: {
            color: '#DC143C',
          },
        }}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Último',
          next: 'Próximo',
          skip: 'Pular',
          stop: 'Parar',
        }}
        callback={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            setIsTourActive(false);
          }
        }}
      />
      <Helmet>
        <title>{`Bubble Safe Chat - ${roomName ? roomName : 'Carregando...'}`}</title>
        <meta name="description" content="Bubble Safe Chat oferece salas de chat seguras e privadas com criptografia de ponta a ponta. Garanta a confidencialidade de suas conversas, com segurança de nível empresarial e recursos avançados de proteção de dados, respeitando regulamentações de privacidade como o GDPR e a LGPD. Converse sem preocupações e com total controle sobre sua privacidade." />
        <meta name="keywords" content="chat seguro, privacidade online, criptografia avançada, salas de chat privadas, segurança de dados, comunicação segura, proteção de dados pessoais, GDPR, LGPD, criptografia ponta a ponta, privacidade nas mensagens, comunicação confidencial, segurança digital, plataforma de chat segura, mensagem autodestrutiva" />
        <meta name="author" content="Bubble Safe Chat" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta property="og:site_name" content="Bubble Safe Chat" />
        <meta property="og:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
        <meta property="og:description" content="Salas de chat seguras e privadas com criptografia avançada. Proteja suas conversas com total privacidade e segurança online, em conformidade com regulamentações como o GDPR e a LGPD." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bubblesafechat.com.br" />
        <meta property="og:image" content="https://bubblesafechat.com.br/icon-page-200.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
        <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com criptografia avançada. Segurança e privacidade são prioridades." />
        <meta name="twitter:image" content="https://bubblesafechat.com.br/icon-page-200.jpg" />
        <link rel="canonical" href="https://bubblesafechat.com.br" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <meta name="robots" content="index, follow" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />
        <meta name="twitter:image:alt" content="Bubble Safe Chat - Segurança Total" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
      </Helmet>

      <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-black">
          <div class="container-fluid">
            <h1 className="d-flex align-items-center mb-4 mt-4">
              <FontAwesomeIcon icon={faDoorOpen} className="icon-bordered me-2" />
              Sala <span className="text-bordered">{roomName}</span>
            </h1>
            <button
              className="navbar-toggler bg-black btn-menv"
              type="button"
              data-toggle="collapse"
              data-target="#navbarCollapse"
              aria-controls="navbarCollapse"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={handleToggle}
            >
              <FontAwesomeIcon
                icon={faEllipsis}
                className={`transition-icon ${isRotated ? 'rotated' : ''}`}
              />
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
              <ul className="navbar-nav ms-auto mb-2 mb-md-0">

                {isCreator ? (
                  <>
                    <li className="nav-item">
                      <button className="dropdown-item compart" onClick={() => confirmAction('share')}>
                        <FontAwesomeIcon icon={faShareAlt} /> Compartilhar
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="dropdown-item qrcode" onClick={() => confirmAction('qr')}>
                        <FontAwesomeIcon icon={faQrcode} /> QR Code
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`dropdown-item d-flex justify-content-between align-items-center ${isDestructionActive ? 'text-success' : 'text-white'}`}
                        onClick={toggleDestruction}
                      >
                        <span>
                          <FontAwesomeIcon icon={faClock} className={`me-2 ${isDestructionActive ? 'text-success' : 'text-white'} autodesc`} />
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
                      <button onClick={setRoomAccessPassword} className="dropdown-item defpass">
                        <FontAwesomeIcon icon={faLock} /> Definir senha de acesso
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className="dropdown-item excchat" onClick={() => confirmAction('delete')}>
                        <FontAwesomeIcon icon={faTrash} /> Excluir Chat
                      </button>
                    </li>
                  </>
                ) : (
                  <li className="nav-item exitchatsd">
                    <button className="dropdown-item" onClick={leaveRoom}>
                      <FontAwesomeIcon icon={faSignOutAlt} /> Sair do Chat
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="title-container mt-3 bg-black text-start">
        <h1 className="d-flex align-items-center mb-4 mt-4">
        </h1>
      </div>

      {isDestructionActive && (
        <div className="alert alert-warning text-center alert-msg-rols" role="alert">
          O Moderador ativou as mensagens autodestrutivas. Todas as mensagens serão excluídas a cada {destructionTime} segundos.
        </div>
      )}

      {isCreator && pendingRequests.length > 0 && (
        <div className="mb-3">
          <ul className="list-group bg-dark">
            <h5 className="text-light text-center">
              <FontAwesomeIcon icon={faBell} className="me-2" style={{ color: "#F75D59" }} />
              Solicitações de entradas no chat</h5>
            {pendingRequests.map((request) => (
              <li
                key={request.id}
                className="list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-dark"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUserSecret} className="me-2" style={{ color: "#FFA62F" }} />
                  {request.userName}
                </div>
                <div>
                  <button
                    className="btn btn-outline-info btn-sm me-2"
                    onClick={() => handleRequest(request.id, 'accept')}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRequest(request.id, 'deny')}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="message-container mb-1" style={{ height: '500px', overflowY: 'scroll', border: '1px solid transparent', borderRadius: '8px', padding: '10px' }}>
        {messages.map((msg) => {
          const timeSinceCreation = (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
          const timeRemaining = destructionTime - timeSinceCreation;
          const isSentByUser = msg.user === userName;
          const remainingTime = timeLeft[msg.id];

          const promptPasswordAndDisplayMessage = async () => {
            let attemptCount = 0;
            const checkPassword = async () => {
              const { value: enteredPassword } = await Swal.fire({
                title: 'Digite a senha para ver a mensagem',
                input: 'password',
                inputLabel: 'Senha',
                inputPlaceholder: 'Digite a senha',
                inputAttributes: {
                  maxlength: 10,
                  autocapitalize: 'off',
                  autocorrect: 'off'
                },
                showCancelButton: true,
              });

              if (enteredPassword) {
                if (enteredPassword === msg.password) {
                  Swal.fire('Correto!', 'Aqui está sua mensagem: ' + msg.text, 'success');
                } else {
                  attemptCount++;
                  if (attemptCount >= 3) {
                    const messageRef = database.ref(`rooms/${roomId}/messages/${msg.id}`);
                    messageRef.remove();
                    Swal.fire('Erro!', 'A senha estava incorreta 3 vezes. A mensagem foi excluída.', 'error');
                  } else {
                    Swal.fire('Erro!', 'Senha incorreta. Tente novamente.', 'error').then(checkPassword);
                  }
                }
              }
            };
            checkPassword();
          };

          return (
            <div className='message' key={msg.id} style={messageStyles(isSentByUser)}>
              <strong style={{ display: 'block', fontSize: '0.85em', color: '#555' }}>
                {msg.user === creatorName && creatorAvatar ? (
                  <img
                    src={creatorAvatar}
                    alt={`${msg.user}'s avatar`}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      marginRight: '1px',
                    }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} className='me-1' />
                )}
                {msg.user}
              </strong>

              {msg.replyTo && (
                <div className="reply-preview mt-1" style={replyPreviewStyles}>
                  <strong>Respondendo a {msg.replyTo.user}:</strong> {msg.replyTo.text}
                </div>
              )}

              <span style={{ fontSize: '11.7px', fontWeight: '400', marginBottom: '20px' }}>
                {msg.requiresPassword ? (
                  <button
                    onClick={promptPasswordAndDisplayMessage}
                    className="btn btn-link"
                    style={{ fontSize: '11px', color: '#007bff' }}
                  >
                    <FontAwesomeIcon icon={faLock} /> Mensagem Protegida (Clique para digitar senha)
                  </button>
                ) : (
                  msg.text ? msg.text : (
                    <button style={{ color: "#fff", fontSize: "20px" }}
                      className="play-button"
                      onClick={() => togglePlayPause(msg.audioUrl, msg.id)}
                      aria-label={`Play áudio da mensagem de ${msg.user}`}
                    >
                      <FontAwesomeIcon
                        icon={playingAudioId === msg.id ? faPauseCircle : faPlayCircle}
                      />
                    </button>
                  )
                )}
              </span>

              {msg.readBy && (
                <div className='sub-textMsg'>
                  <small>lido por: {msg.readBy.join(', ')}</small>
                </div>
              )}

              {isDestructionActive && timeRemaining > 0 && (
                <div>
                  <small>Destrói em: {Math.max(timeRemaining.toFixed(0), 0)}s</small>
                </div>
              )}

              {msg.user !== 'Sistema' && (
                <button
                  className="btn btn-link"
                  onClick={() => setReplyingTo(msg)}
                  style={{ fontSize: '11px', color: '#007bff', padding: '1px 1px' }}
                  aria-label={`Responder a mensagem de ${msg.user}`}
                >
                  Responder
                </button>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {replyingTo && (
        <div className="replying-to mb-2" style={{ borderLeft: '3px solid #007bff', paddingLeft: '10px' }}>
          <span><strong>Respondendo a {replyingTo.user}:</strong> {replyingTo.text}</span>
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => setReplyingTo(null)}>
            Cancelar
          </button>
        </div>
      )}

      {typingUsers.length > 0 && (
        <div className='ms-2' style={{ fontSize: '10px' }}>
          <em>{typingUsers.join(', ')} {typingUsers.length > 1 ? 'estão' : 'está'} digitando...</em>
        </div>
      )}

      <div className="d-flex align-items-center">
        {recording ? (
          <>
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Escreva sua mensagem"
              onFocus={markAllMessagesAsRead}
              className="form-control me-2 msg-user2"
              disabled
            />
            <button onClick={stopRecording} className="btn btn-warning me-2">
              <FontAwesomeIcon icon={faStopCircle} />
            </button>
            <span className="text-warning ms-2">Gravando...</span>
          </>
        ) : audioFile ? (
          <div className="audio-controls-container-22 d-flex align-items-center flex-wrap">
            <audio
              controls
              src={URL.createObjectURL(audioFile)}
              style={{ width: '100%', maxWidth: '200px', marginRight: '10px' }}
            />
            <button onClick={sendAudioMessage} disabled={!audioFile} className="btn btn-outline-primary me-2">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
            <button onClick={() => setAudioFile(null)} className="btn btn-outline-danger">
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        ) : (
          <>
            <div className="input-with-icon w-100">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Escreva sua mensagem"
                onFocus={markAllMessagesAsRead}
                className="form-control msg-user1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && message.trim()) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                style={{ paddingRight: '40px' }}
              />

              <button
                onClick={startRecording}
                disabled={recording}
                className="btn-icon audusd"
                style={{
                  position: 'absolute',
                  right: '0.8px',
                  top: '40%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#007bff',
                }}
              >
                <FontAwesomeIcon icon={faMicrophone} />
              </button>
            </div>

            <div className="d-flex align-items-center">
              <button onClick={sendMessage} disabled={!message.trim()} className="btn btn-primary me-2 rounded-5 sendmsgd">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>

              {showPlusButton && !showOptions ? (
                <button onClick={toggleOptions} className="btn btn-warning rounded-5">
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              ) : null}

              {!showPlusButton || showOptions ? (
                <div className="btn-group d-flex">
                  <button onClick={sendProtectedMessage} className="btn btn-warning me-2 rounded-5 blocks">
                    <FontAwesomeIcon icon={faLock} />
                  </button>
                  <button style={{ borderRadius: "10rem" }} onClick={recognitionActive ? stopRecognition : startRecognition} className="btn btn-warning me-2 audiosescri">
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                  {isCreator && (
                    <button style={{ borderRadius: "30rem" }} className="btn btn-warning excluiuserma" onClick={toggleExpelModal}>
                      <FontAwesomeIcon icon={faUserSlash} style={{ width: "0.9rem" }} />
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>

      {isCreator && (
        <div>
          <p className='d-none'>Link: <a href={shareLink}>{shareLink}</a></p>
        </div>
      )}

      {showExpelModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content bg-dark">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FontAwesomeIcon icon={faUserSlash} /> Expulsar Usuários
                </h5>
                <button type="button" className="btn-close text-bg-light" aria-label="Close" onClick={toggleExpelModal}></button>
              </div>
              <div className="modal-body bg-dark">
                <div className="d-flex align-items-center">
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="form-select my-2 border border-primary"
                  >
                    <option value="">Selecione um usuário</option>
                    {allUsers.map((user) => (
                      <option key={user} value={user}>
                        {user}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      expelUser(selectedUser);
                      toggleExpelModal();
                    }}
                    disabled={!selectedUser}
                    style={{ transition: 'background-color 0.3s' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#c82333')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                  <button
                    className="btn btn-danger my-2"
                    onClick={expelAllUsers}
                    style={{ transition: 'background-color 0.3s' }}
                  >
                    Expulsar Todos os Usuários
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (<div className="alert alert-success d-flex align-items-center" role="alert">
        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
        <span>{statusMessage}</span>
      </div>
      )}
    </div>
  );
};

export default Room;