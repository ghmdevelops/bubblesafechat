import React, { useState, useEffect, useRef } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { database, auth, storage } from '../firebaseConfig';
import { QRCodeCanvas } from 'qrcode.react';

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

  const shareLink = `${window.location.origin}/opensecurityroom/#/room/${roomId}`;

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);
    roomRef.once('value', (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        setRoomName(roomData.name);
        setCreatorName(roomData.creatorName || 'Moderador');
        const currentUser = auth.currentUser;
        if (currentUser && roomData.creator === currentUser.uid) {
          setIsCreator(true);
          setUserName(roomData.creatorName || 'Moderador');
        }
      }
      setIsRoomLoaded(true);
    });
  }, [roomId]);

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
    .filter((user) => user !== creatorName && user !== 'Sistema'));

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
    // Mensagem informando que a sala foi encerrada pelo moderador
    database.ref(`rooms/${roomId}/messages`).push({
      text: `A sala foi encerrada pelo moderador.`,
      user: 'Sistema',
      timestamp: new Date().toISOString(),
    });

    // Deletar todos os áudios antes de excluir a sala
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

  const toggleDestruction = () => {
    setIsDestructionActive((prevState) => !prevState);
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
      <h1>Sala de Chat - {roomName}</h1>

      {isCreator && (
        <div>
          <label>
            <strong>Mensagens Autodestrutivas: </strong>
            <input
              type="checkbox"
              checked={isDestructionActive}
              onChange={toggleDestruction}
            />
            {isDestructionActive ? 'Ativado' : 'Desativado'}
          </label>
          <div>
            <label>
              <strong>Tempo de destruição (segundos): </strong>
              <input
                type="number"
                value={destructionTime}
                onChange={(e) => setDestructionTime(Number(e.target.value))}
                disabled={!isDestructionActive}
              />
            </label>
          </div>
        </div>
      )}

      {isCreator && pendingRequests.length > 0 && (
        <div>
          <h3>Solicitações de entrada:</h3>
          <ul>
            {pendingRequests.map((request) => (
              <li key={request.id}>
                {request.userName}
                <button onClick={() => handleRequest(request.id, 'accept')}>Aceitar</button>
                <button onClick={() => handleRequest(request.id, 'deny')}>Negar</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', marginBottom: '10px' }}>
        {messages.map((msg) => {
          const timeSinceCreation = (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
          const timeRemaining = destructionTime - timeSinceCreation;

          return (
            <div key={msg.id} style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
              <strong>{msg.user}:</strong> {msg.text ? msg.text : <button onClick={() => playAudio(msg.audioUrl)}>Reproduzir Áudio</button>}
              {msg.readBy && (
                <div>
                  <small>Lido por: {msg.readBy.join(', ')}</small>
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
      </div>

      {typingUsers.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <em>{typingUsers.join(', ')} {typingUsers.length > 1 ? 'estão' : 'está'} digitando...</em>
        </div>
      )}

      <input
        type="text"
        value={message}
        onChange={handleTyping}
        placeholder="Escreva sua mensagem"
        onFocus={markAllMessagesAsRead}
      />
      <button onClick={sendMessage} disabled={!message.trim()}>
        Enviar
      </button>

      <div>
        <button onClick={startRecording} disabled={recording}>
          Gravar Áudio
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          Parar Gravação
        </button>
        {audioFile && (
          <div>
            <button onClick={sendAudioMessage}>Enviar Áudio</button>
          </div>
        )}
      </div>

      {isCreator && (
        <div>
          <h3>Compartilhar link do chat:</h3>
          <p>Link: <a href={shareLink}>{shareLink}</a></p>
          <QRCodeCanvas value={shareLink} size={128} />
          <button onClick={leaveRoom}>Sair</button>
          <button onClick={deleteChat}>Excluir Chat</button>
        </div>
      )}

      {isCreator && (
        <div>
          <h3>Expulsar Usuários:</h3>
          {Array.from(usersWithExpelButton).map((user) => (
            <div key={user}>
              <button onClick={() => expelUser(user)}>Expulsar {user}</button>
            </div>
          ))}
        </div>
      )}

      {statusMessage && <p style={{ color: 'green' }}>{statusMessage}</p>}
    </div>
  );
};

export default Room;
