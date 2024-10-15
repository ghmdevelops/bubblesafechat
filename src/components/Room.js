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
import { faPauseCircle, faDoorOpen, faSignInAlt, faUser, faClock, faSignOutAlt, faUserCircle, faPaperPlane, faMicrophone, faCheckCircle, faStopCircle, faTrashAlt, faPlayCircle, faClipboard, faQrcode, faShareAlt, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { Helmet } from 'react-helmet';
import iconPage from './img/icon-menu.png'

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

  const shareLink = `${window.location.origin}/bubblesafechat/#/room/${roomId}`;

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    const allowedRef = roomRef.child('allowedUsers');

    const currentUser = auth.currentUser;
    if (currentUser) {
      const sanitizedUserName = sanitizeUserName(currentUser.displayName || currentUser.email);
      allowedRef.child(sanitizedUserName).once('value', (snapshot) => {
        if (snapshot.exists()) {
          setHasJoined(true);
        }
      });
    }

    roomRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        setRoomName(roomData.name);
        setCreatorName(roomData.creatorName || 'Moderador');
        if (currentUser && roomData.creator === currentUser.uid) {
          setIsCreator(true);
          setUserName(roomData.creatorName || 'Moderador');
        }
      }
      setIsRoomLoaded(true);
    });
  }, [roomId]);

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
      if (!isCreator) {
        const chatMessage = document.createElement('div');
        chatMessage.textContent = `${userName} saiu da sala.`;
        chatMessage.style.color = 'red';
        document.getElementById('chat-container').appendChild(chatMessage);
      }
    };
    return () => {
    };
  }, [userName, roomId, isCreator]);

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
    if (messagesEndRef.current) {
      const messageContainer = document.querySelector('.message-container');
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

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

      setUsersWithExpelButton((prevUsers) => new Set([...prevUsers].filter((user) => user !== userName)));
    });
  };

  const sendMessage = () => {
    if (message.trim()) {
      const deletionTime = Date.now() + destructionTime * 1000;
      const messageRef = database.ref(`rooms/${roomId}/messages`).push();

      messageRef.set({
        text: message,
        user: userName || creatorName,
        timestamp: new Date().toISOString(),
        deletionTime: isDestructionActive ? deletionTime : null,
      });
      setMessage('');
      setTyping(false);
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
    setMessage(e.target.value);
    setTyping(true);
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
      }, 2000);
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
        title: 'Escolha o tempo de destruição (segundos):',
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
          navigator.clipboard.writeText(shareLink)
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
          window.open(`mailto:?subject=Compartilhe este link&body=Confira este link do chat: ${shareLink}`, '_blank', 'noopener,noreferrer');
          Swal.close();
        });

        document.getElementById('whatsappLink').addEventListener('click', () => {
          window.open(`https://api.whatsapp.com/send?text=Confira este link do chat: ${shareLink}`, '_blank', 'noopener,noreferrer');
          Swal.close();
        });

        document.getElementById('telegramLink').addEventListener('click', () => {
          window.open(`https://t.me/share/url?url=${shareLink}`, '_blank', 'noopener,noreferrer');
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
    ReactDOM.render(<QRCodeModal shareLink={shareLink} />, modalContent);

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
        <div className="card p-4 shadow bg-dark text-light mt-5 mb-5" style={{ width: '100%', maxWidth: '600px' }}>
          <img className='col-md-4 col-lg-4 col-xl-4 mx-auto mb-4' style={{ width: '  110px' }} src={iconPage} alt='OpenSecurityRoom' />
          <h1 className="text-center mb-4">Solicitação de Entrada</h1>
          <p className="text-center">
            <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: '#00a6e8' }} />
            Insira seu nome para solicitar acesso à sala
          </p>
          <div className="d-flex justify-content-center">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome"
              className="form-control mt-1 mb-1"
              style={{ maxWidth: '100%', width: '100%', height: '45px' }}
            />
          </div>
          <div className="d-grid gap-2 mt-3">
            <button
              onClick={requestAccess}
              disabled={!userName.trim() || loading}
              className="btn btn-primary w-100 mt-3 mb-2"
              style={{ height: '50px' }}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
              Solicitar Acesso
            </button>
          </div>
          {loading && (
            <div className="d-flex justify-content-center mt-3">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          )}
          {statusMessage && (
            <div className="alert alert-info text-center mt-3" role="alert">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isRoomLoaded) {
    return <div>Carregando a sala...</div>;
  }

  return (
    <div>
      <Helmet>
        <title>{`Bubble Safe Chat - ${roomName ? roomName : 'Carregando...'}`}</title>
        <meta name="description" content="Entre no Bubble Safe Chat para criar ou acessar salas de chat seguras e privadas. Junte-se à comunidade e proteja suas conversas online." />
        <meta name="keywords" content="login, registro, chat seguro, privacidade, criptografia, comunidade online, segurança digital" />
        <meta name="author" content="Bubble Safe Chat" />
        <meta property="og:title" content='Bubble Safe Chat - Login Seguro' />
        <meta property="og:description" content="Participe da Bubble Safe Chat para criar ou acessar salas de chat criptografadas. Segurança e privacidade são prioridades." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="URL_da_imagem_de_visualização" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content='Bubble Safe Chat - Login Seguro' />
        <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com segurança máxima." />
        <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
        <link rel="canonical" href={window.location.href} />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
      </Helmet>

      <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
          <div class="container-fluid">
            <img
              className="navbar-brand img-fluid responsive-img"
              src={iconPage}
              alt="OpenSecurityRoom"
            />
            <button class="navbar-toggler  bg-black" type="button" data-toggle="collapse" data-target="#navbarCollapse"
              aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
              <ul className="navbar-nav ms-auto mb-2 mb-md-0">

                {isCreator ? (
                  <>
                    <li class="nav-item">
                      <button className="dropdown-item" onClick={() => confirmAction('share')}>
                        <FontAwesomeIcon icon={faShareAlt} /> Compartilhar
                      </button>
                    </li>
                    <li class="nav-item">
                      <button className="dropdown-item" onClick={() => confirmAction('delete')}>
                        <FontAwesomeIcon icon={faTrash} /> Excluir Chat
                      </button>
                    </li>
                    <li class="nav-item">
                      <button className="dropdown-item" onClick={() => confirmAction('qr')}>
                        <FontAwesomeIcon icon={faQrcode} /> QR Code
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
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

      <div className="title-container">
        <h1 className="text-center mb-2 mt-4"><FontAwesomeIcon icon={faDoorOpen} /> Room {roomName}</h1>
      </div>

      {isDestructionActive && (
        <div className="alert alert-warning text-center" role="alert">
          O Moderador ativou as mensagens autodestrutivas. Todas as mensagens serão excluídas a cada {destructionTime} segundos.
        </div>
      )}

      {isCreator && (
        <div className="mb-4 mt-4">
          <div className="d-flex">
            <div className="form-check form-switch me-3">
              <input
                type="checkbox"
                checked={isDestructionActive}
                onChange={toggleDestruction}
                id="destructionSwitch"
                className="form-check-input visually-hidden"
              />
              <label className="form-check-label label-checks" htmlFor="destructionSwitch">
                <div className="toggle-container p-3 rounded d-flex flex-column align-items-center">
                  <div className={`toggle-header d-flex align-items-center justify-content-center mb-2 ${isDestructionActive ? 'active' : 'inactive'}`}>
                    <FontAwesomeIcon icon={faClock} className="me-2 icon-clock" />
                    <strong className="toggle-title">Autodestruição</strong>
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="d-none">
                <strong>Tempo de destruição (segundos):</strong>
                <input
                  type="number"
                  value={destructionTime}
                  onChange={(e) => setDestructionTime(Number(e.target.value))}
                  disabled={!isDestructionActive}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {isCreator && pendingRequests.length > 0 && (
        <div className="mb-3">
          <h5 className="text-light text-center">Solicitações de entradas no chat</h5>
          <ul className="list-group bg-dark">
            {pendingRequests.map((request) => (
              <li
                key={request.id}
                className="list-group-item d-flex justify-content-between align-items-center bg-dark text-light border-dark"
              >
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  {request.userName}
                </div>
                <div>
                  <button
                    className="btn btn-outline-info btn-sm me-2"
                    onClick={() => handleRequest(request.id, 'accept')}
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    Aceitar
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleRequest(request.id, 'deny')}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-1" />
                    Negar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="message-container mb-1" style={{ height: '470px', overflowY: 'scroll', border: '1px solid #0059ac', borderRadius: '8px', padding: '10px' }}>
        {messages.map((msg) => {
          const timeSinceCreation = (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
          const timeRemaining = destructionTime - timeSinceCreation;
          const isSentByUser = msg.user === userName;
          const remainingTime = timeLeft[msg.id];

          return (
            <div className='message'
              key={msg.id}
              style={{
                padding: '4px',
                borderRadius: '15px',
                margin: isSentByUser ? '10px 0 5px auto' : '10px auto 5px 0',
                backgroundColor: isSentByUser ? '#d6eaff' : '#f1f1f1',
                maxWidth: '80%',
                textAlign: isSentByUser ? 'right' : 'left',
                position: 'relative',
                color: '#000',
              }}
            >
              <strong style={{ display: 'block', fontSize: '0.85em', color: '#555' }}><FontAwesomeIcon icon={faUserCircle} /> {msg.user}</strong>
              <span style={{ fontSize: '11.7px', fontWeight: '400', marginBottom: '20px' }}>
                {msg.text ? msg.text : <button style={{ color: "#fff", fontSize: "20px" }}
                  className="play-button"
                  onClick={() => togglePlayPause(msg.audioUrl, msg.id)}
                >
                  <FontAwesomeIcon
                    icon={playingAudioId === msg.id ? faPauseCircle : faPlayCircle}
                  />
                </button>}
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
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

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
              className="form-control me-2"
              disabled
            />
            <button onClick={stopRecording} className="btn btn-warning me-2">
              <FontAwesomeIcon icon={faStopCircle} />
            </button>
            <span className="text-warning ms-2">Gravando...</span>
          </>
        ) : audioFile ? (
          <div className="d-flex align-items-center">
            <audio controls src={URL.createObjectURL(audioFile)} style={{ width: '200px', marginRight: '10px' }} />
            <button onClick={sendAudioMessage} disabled={!audioFile} className="btn btn-primary me-2">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
            <button onClick={() => setAudioFile(null)} className="btn btn-danger">
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={message}
              onChange={handleTyping}
              placeholder="Escreva sua mensagem"
              onFocus={markAllMessagesAsRead}
              className="form-control me-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && message.trim()) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage} disabled={!message.trim()} className="btn btn-primary me-2">
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
            <button onClick={startRecording} disabled={recording} className="btn btn-secondary me-2">
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          </>
        )}
      </div>

      {isCreator && (
        <div>
          <p className='d-none'>Link: <a href={shareLink}>{shareLink}</a></p>
        </div>
      )}

      {isCreator && (
        <div>
          <h3 className='ms-2'>Expulsar Usuários</h3>
          {Array.from(usersWithExpelButton).map((user) => (
            <div key={user}>
              <button className='mb-4 btn-exitUser btn btn-danger' onClick={() => expelUser(user)}>
                Expulsar {user}
              </button>
            </div>
          ))}
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
