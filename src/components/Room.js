import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database, auth } from '../firebaseConfig';
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
  const [destructionTime, setDestructionTime] = useState(10); // Tempo de destruição em segundos
  const [isDestructionActive, setIsDestructionActive] = useState(false); // Controle para ativar/desativar a destruição
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

  // Carregar as mensagens do chat
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

  // Função para marcar mensagens como lidas
  const markMessageAsRead = (messageId) => {
    const readByRef = database.ref(`rooms/${roomId}/messages/${messageId}/readBy`);
    readByRef.once('value', (snapshot) => {
      const readBy = snapshot.val() || [];
      if (!readBy.includes(userName)) {
        readByRef.set([...readBy, userName]);
      }
    });
  };

  // Função que marca todas as mensagens visíveis como lidas
  const markAllMessagesAsRead = () => {
    messages.forEach((msg) => {
      markMessageAsRead(msg.id);
    });
  };

  // Função para autodestruir as mensagens após o tempo definido
  const autoDestructMessages = () => {
    if (isDestructionActive) {
      messages.forEach((msg) => {
        const timeSinceCreation = (Date.now() - new Date(msg.timestamp).getTime()) / 1000;
        if (timeSinceCreation >= destructionTime) {
          const messageRef = database.ref(`rooms/${roomId}/messages/${msg.id}`);
          messageRef.remove();
        }
      });
    }
  };

  // Iniciar o temporizador de autodestruição
  useEffect(() => {
    const interval = setInterval(() => {
      autoDestructMessages();
    }, 1000);

    return () => clearInterval(interval);
  }, [messages, destructionTime, isDestructionActive]);

  // Carregar quem está digitando
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

  // Carregar solicitações pendentes de entrada (somente criador)
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

  // Função para expulsar um usuário
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

  // Manter controle dos usuários já listados para evitar botões repetidos, excluindo o criador e "Sistema"
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
    database.ref(`rooms/${roomId}`).remove().then(() => {
      setHasJoined(false);
      setUserName('');
      setStatusMessage('Sala excluída com sucesso!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    });
  };

  // Função para alternar a ativação/desativação das mensagens autodestrutivas
  const toggleDestruction = () => {
    setIsDestructionActive((prevState) => !prevState);
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
              <strong>{msg.user}:</strong> {msg.text}
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
