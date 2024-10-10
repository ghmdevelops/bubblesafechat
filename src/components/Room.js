import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database, auth, storage } from '../firebaseConfig';
import { QRCodeCanvas } from 'qrcode.react';
import './Room.css';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server'; // Adicione esta importação
import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faMicrophone, faCheckCircle, faStopCircle, faTrashAlt, faPlayCircle, faClipboard, faQrcode, faShareAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faTelegram } from '@fortawesome/free-brands-svg-icons';
import { Helmet } from 'react-helmet';

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
  const messagesEndRef = useRef(null); // Ref para o final do container de mensagens
  const [shareMethod, setShareMethod] = useState('');
  const [expelledUsers, setExpelledUsers] = useState([]); // Estado para armazenar os usuários expulsos


  const shareLink = `${window.location.origin}/opensecurityroom/#/room/${roomId}`;

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    const allowedRef = roomRef.child('allowedUsers');

    const currentUser = auth.currentUser;
    if (currentUser) {
      const sanitizedUserName = sanitizeUserName(currentUser.displayName || currentUser.email);
      allowedRef.child(sanitizedUserName).once('value', (snapshot) => {
        if (snapshot.exists()) {
          setHasJoined(true); // O usuário já está na lista de permitidos
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
    const handleBeforeUnload = (event) => {
      if (!isCreator) { // Apenas para usuários que não são criadores
        database.ref(`rooms/${roomId}/messages`).push({
          text: `${userName} saiu da sala.`,
          user: 'Sistema',
          timestamp: new Date().toISOString(),
        });

        const message = "Você tem certeza que deseja sair da sala?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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

  // Função para fazer scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll suave até a última mensagem
    }
  }, [messages]); // Executa sempre que as mensagens mudam

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

    const requestsRef = database.ref(`rooms/${roomId}/requests`).push();
    requestsRef
      .set({
        userName,
        timestamp: new Date().toISOString(),
      })
      .then(() => {
        setHasRequestedAccess(true);
        setStatusMessage('Solicitação de entrada enviada. Aguarde aprovação.');
      })
      .catch((error) => {
        console.log('Erro ao enviar solicitação:', error);
        setStatusMessage('Erro ao enviar solicitação. Tente novamente.');
      });
  };

  useEffect(() => {
    if (!hasRequestedAccess) return;

    const allowedRef = database.ref(`rooms/${roomId}/allowedUsers/${userName}`);
    const deniedRef = database.ref(`rooms/${roomId}/deniedRequests/${userName}`);
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers/${userName}`);

    allowedRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        setHasJoined(true);
        localStorage.setItem('hasJoined', 'true');
        localStorage.setItem('userName', userName);
        navigate(`/room/${roomId}`);
      }
    });

    deniedRef.on('value', (snapshot) => {
      if (snapshot.exists() && !isCreator) {
        setStatusMessage('Sua solicitação foi recusada. Redirecionando...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    });

    expelledRef.on('value', (snapshot) => {
      if (snapshot.exists() && !isCreator) {
        setStatusMessage('Você foi expulso da sala. Redirecionando...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    });

    return () => {
      allowedRef.off();
      deniedRef.off();
      expelledRef.off();
    };
  }, [roomId, userName, navigate, isCreator, hasRequestedAccess]);

  const sanitizeUserName = (userName) => {
    return userName.replace(/[.#$[\]]/g, '_'); // Substitui caracteres inválidos por "_"
  };

  const expelUser = (userName) => {
    const expelledRef = database.ref(`rooms/${roomId}/expelledUsers/${userName}`);
    expelledRef.set(true).then(() => {
      database.ref(`rooms/${roomId}/messages`).push({
        text: `${userName} foi expulso da sala.`,
        user: 'Sistema',
        timestamp: new Date().toISOString(),
      });
    });
  };

  const usersWithExpelButton = new Set(messages
    .map((msg) => msg.user)
    .filter((user) => user !== creatorName && user !== 'Sistema' && !expelledUsers.includes(user))); // Filtra usuários expulsos

  const sendMessage = () => {
    if (message.trim()) {
      const messageRef = database.ref(`rooms/${roomId}/messages`).push();
      messageRef.set({
        text: message,
        user: userName || creatorName,
        timestamp: new Date().toISOString(),
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
    setStatusMessage('Você saiu da sala.');
    setTimeout(() => {
      localStorage.removeItem('hasJoined');
      navigate('/');
    }, 2000);
  };

  const deleteChat = () => {
    database.ref(`rooms/${roomId}/messages`).push({
      text: `A sala foi encerrada pelo moderador.`,
      user: 'Sistema',
      timestamp: new Date().toISOString(),
    });

    const deleteMessagesPromises = messages.map((msg) => {
      return new Promise((resolve) => {
        const messageRef = database.ref(`rooms/${roomId}/messages/${msg.id}`);
        messageRef.once('value', (snapshot) => {
          const messageData = snapshot.val();
          if (messageData && messageData.audioUrl) {
            const audioRef = storage.refFromURL(messageData.audioUrl);
            audioRef.delete().catch((error) => {
              console.error('Erro ao deletar áudio:', error);
            });
          }
          messageRef.remove().then(resolve);
        });
      });
    });

    Promise.all(deleteMessagesPromises).then(() => {
      database.ref(`rooms/${roomId}`).remove().then(() => {
        setHasJoined(false);
        setUserName('');
        setStatusMessage('Sala excluída com sucesso!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      });
    });
  };

  const toggleDestruction = async () => {
    if (!isDestructionActive) {
      const { value: destructionTime } = await Swal.fire({
        title: 'Escolha o tempo de destruição (segundos):',
        input: 'number',
        inputAttributes: {
          min: 1,
          max: 300, // Limite máximo, ajuste conforme necessário
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
        setDestructionTime(destructionTime); // Atualiza o tempo de destruição
        setIsDestructionActive(true); // Ativa a destruição
      }
    } else {
      setIsDestructionActive(false); // Desativa a destruição
    }
  };

  const handleShare = (method) => {
    if (method === 'copy') {
      navigator.clipboard.writeText(shareLink)
        .then(() => {
          alert('Link copiado para a área de transferência!');
        })
        .catch(err => {
          console.error('Erro ao copiar: ', err);
        });
    } else if (method === 'email') {
      window.open(`mailto:?subject=Compartilhe este link&body=Confira este link do chat: ${shareLink}`, '_blank');
    } else if (method === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=Confira este link do chat: ${shareLink}`, '_blank');
    } else if (method === 'telegram') {
      window.open(`https://t.me/share/url?url=${shareLink}`, '_blank');
    }
  };

  // Função para gravar áudio
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        streamRef.current = stream; // Armazenar o stream para fechamento posterior
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
      // Liberar o microfone
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setRecording(false);
    }
  };

  const sendAudioMessage = () => {
    if (audioFile) {
      // Enviar o arquivo de áudio para o Firebase Storage
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
            // Enviar a URL do áudio para o Firebase Realtime Database
            const messageRef = database.ref(`rooms/${roomId}/messages`).push();
            const audioMessage = {
              audioUrl: downloadURL,
              user: userName || creatorName,
              timestamp: new Date().toISOString(),
            };
            messageRef.set(audioMessage);
            setAudioFile(null); // Limpar o arquivo de áudio após o envio
          });
        }
      );
    }
  };

  // Função para reproduzir o áudio
  const playAudio = (audioUrl) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const showShareModal = () => {
    const content = (
      <div>
        <div className="mb-3">
          <button className="btn btn-primary w-100 mb-2" onClick={() => { handleShare('copy'); Swal.close(); }}>
            <FontAwesomeIcon icon={faClipboard} className="me-2" /> Copiar Link
          </button>
          <button className="btn btn-primary w-100 mb-2" onClick={() => { handleShare('email'); Swal.close(); }}>
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" /> Enviar por E-mail
          </button>
          <button className="btn btn-primary w-100 mb-2" onClick={() => { handleShare('whatsapp'); Swal.close(); }}>
            <FontAwesomeIcon icon={faWhatsapp} className="me-2" /> Compartilhar no WhatsApp
          </button>
          <button className="btn btn-primary w-100" onClick={() => { handleShare('telegram'); Swal.close(); }}>
            <FontAwesomeIcon icon={faTelegram} className="me-2" /> Compartilhar no Telegram
          </button>
        </div>
      </div>
    );

    // Converte o conteúdo para uma string HTML
    const contentString = ReactDOMServer.renderToString(content);

    Swal.fire({
      title: 'Escolha uma opção para compartilhar',
      html: contentString,
      showCloseButton: true,
      confirmButtonText: 'Fechar',
    });
  };

  const confirmAction = (actionType) => {
    let title, text, onConfirm;

    // Define o título, texto e ação de acordo com o botão clicado
    switch (actionType) {
      case 'share':
        title = 'Compartilhar';
        text = 'Você deseja compartilhar o link?';
        onConfirm = showShareModal; // Ação ao confirmar
        break;
      case 'delete':
        title = 'Excluir Chat';
        text = 'Você tem certeza que deseja excluir o chat? Esta ação não pode ser desfeita.';
        onConfirm = deleteChat; // Ação ao confirmar
        break;
      case 'qr':
        title = 'QR Code';
        text = 'Você deseja visualizar o QR Code do chat?';
        onConfirm = showQRCode; // Ação ao confirmar
        break;
      default:
        return;
    }

    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm(); // Chama a ação correspondente se confirmado
      }
    });
  };

  const QRCodeModal = ({ shareLink }) => (
    <div style={{
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '100%', /* Garante que o contêiner não exceda a largura da tela */
      padding: '10px' /* Adiciona um pouco de espaçamento */
    }}>
      <QRCodeCanvas
        value={shareLink}
        size={Math.min(window.innerWidth * 0.8, 190)} // Ajusta o tamanho com base na largura da tela, máximo de 190px
        style={{
          borderRadius: '10px',
          overflow: 'hidden',
          width: '100%', // Faz com que o QR Code ocupe 100% da largura disponível
          height: 'auto' // Mantém a proporção ao ajustar a largura
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
      confirmButtonText: 'Fechar',
    });
  };

  if (!hasJoined && !isCreator) {
    return (
      <div>
        <h1>Solicitação de entrada</h1>
        <p>Insira seu nome para solicitar acesso à sala:</p>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Digite seu nome"
        />
        <button onClick={requestAccess} disabled={!userName.trim()}>
          Solicitar acesso
        </button>
        {statusMessage && <p>{statusMessage}</p>}
      </div>
    );
  }

  if (!isRoomLoaded) {
    return <div>Carregando a sala...</div>;
  }

  return (
    <div>
      <Helmet>
        <title>{'Open Security Room - Chat'}</title>
        <meta name="description" content="Faça login para acessar suas salas de chat na Open Security Room ou crie uma nova conta para se juntar à comunidade." />
        <meta name="keywords" content="login, registro, chat, segurança, comunidade" />
        <meta name="author" content="Open Security Room" />
        <meta property="og:title" content={'Open Security Room - Chat'} />
        <meta property="og:description" content="Acesse suas salas de chat ou crie uma nova conta na Open Security Room." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="URL_da_imagem_de_visualização" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={'Open Security Room - Chat'} />
        <meta name="twitter:description" content="Acesse suas salas de chat ou crie uma nova conta na Open Security Room." />
        <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <h1 className="text-center mt-2">Chat {roomName}</h1>

      {isCreator && (
        <div className="mb-3 mt-4">
          <div className="d-flex align-items-center">
            <div className="form-check form-switch me-3">
              <input
                type="checkbox"
                checked={isDestructionActive}
                onChange={toggleDestruction}
                id="destructionSwitch"
                className="form-check-input visually-hidden"
              />
              <label className="form-check-label label-checks" htmlFor="destructionSwitch">
                <div className="mb-3 mt-3">
                  <strong>Mensagens Autodestrutivas</strong>
                  <span className={isDestructionActive ? 'text-success' : 'text-danger'}>
                    {isDestructionActive ? ' Ativado' : ' Desativado'}
                  </span>
                  <button className="btn btn-primary w-10 mb-2" onClick={() => confirmAction('share')}>
                    <FontAwesomeIcon icon={faShareAlt} />
                  </button>
                  <button className="btn btn-danger d-none" onClick={() => confirmAction('leave')}>
                    Sair
                  </button>
                  <button className="btn btn-danger w-10 mb-2" onClick={() => confirmAction('delete')}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <button className="btn btn-primary w-10 mb-2" onClick={() => confirmAction('qr')}>
                    <FontAwesomeIcon icon={faQrcode} />
                  </button>
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
          <h5>Solicitações de entradas no chat</h5>
          <ul className="list-group">
            {pendingRequests.map((request) => (
              <li key={request.id} className="list-group-item d-flex justify-content-between align-items-center">
                {request.userName}
                <div>
                  <button className="btn btn-success btn-sm" onClick={() => handleRequest(request.id, 'accept')}>Aceitar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleRequest(request.id, 'deny')}>Negar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="message-container mb-3" style={{ height: '300px', overflowY: 'scroll', border: '1px solid transparent', borderRadius: '8px', padding: '10px' }}>
        {messages.map((msg) => {
          const timeSinceCreation = (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
          const timeRemaining = destructionTime - timeSinceCreation;
          const isSentByUser = msg.user === userName; // Verifica se a mensagem é do usuário atual

          return (
            <div
              key={msg.id}
              style={{
                padding: '8px',
                borderRadius: '15px',
                margin: isSentByUser ? '5px 0 5px auto' : '5px auto 5px 0',
                backgroundColor: isSentByUser ? '#dcf8c6' : '#f1f1f1',
                maxWidth: '70%',
                textAlign: isSentByUser ? 'right' : 'left',
                position: 'relative',
                color: '#000',
              }}
            >
              <strong style={{ display: 'block', fontSize: '0.85em', color: '#555' }}>{msg.user}</strong>
              <span>
                {msg.text ? msg.text : <button onClick={() => playAudio(msg.audioUrl)}><FontAwesomeIcon icon={faPlayCircle} /></button>}
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
        <div style={{ marginBottom: '10px' }}>
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
              disabled // Desabilita o input enquanto grava
            />
            <button onClick={stopRecording} className="btn btn-warning me-2">
              <FontAwesomeIcon icon={faStopCircle} /> {/* Ícone para Parar Gravação */}
            </button>
            <span className="text-warning ms-2">Gravando...</span> {/* Span de gravação */}
          </>
        ) : audioFile ? ( // Verifica se há um arquivo de áudio
          <div className="d-flex align-items-center">
            <audio controls src={URL.createObjectURL(audioFile)} style={{ width: '200px', marginRight: '10px' }} />
            <button onClick={sendAudioMessage} disabled={!audioFile} className="btn btn-primary me-2">
              <FontAwesomeIcon icon={faPaperPlane} /> {/* Ícone para Enviar Áudio */}
            </button>
            <button onClick={() => setAudioFile(null)} className="btn btn-danger">
              <FontAwesomeIcon icon={faTrashAlt} /> {/* Ícone para Cancelar */}
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
                  e.preventDefault(); // Previne a quebra de linha
                  sendMessage(); // Chama a função para enviar a mensagem
                }
              }}
            />
            <button onClick={sendMessage} disabled={!message.trim()} className="btn btn-primary me-2">
              <FontAwesomeIcon icon={faPaperPlane} /> {/* Ícone para Enviar */}
            </button>
            <button onClick={startRecording} disabled={recording} className="btn btn-secondary me-2">
              <FontAwesomeIcon icon={faMicrophone} /> {/* Ícone para Gravar Áudio */}
            </button>
          </>
        )}
      </div>

      {isCreator && (
        <div>
          <p className='d-none'>Link: <a href={shareLink}>{shareLink}</a></p>

          {shareMethod && (
            <div>
              <h4>Você escolheu compartilhar via: {shareMethod === 'copy' ? 'Copiar Link' : shareMethod === 'email' ? 'Enviar por E-mail' : shareMethod === 'whatsapp' ? 'Compartilhar no WhatsApp' : 'Compartilhar no Telegram'}</h4>
              <button className="btn btn-primary" onClick={() => handleShare(shareMethod)}>Confirmar Compartilhamento</button>
            </div>
          )}
        </div>
      )}

      {isCreator && (
        <div>
          <h3>Expulsar Usuários</h3>
          {Array.from(usersWithExpelButton).map((user) => (
            <div key={user}>
              <button className='btn-exitUser' onClick={() => expelUser(user)}>Expulsar {user}</button>
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
