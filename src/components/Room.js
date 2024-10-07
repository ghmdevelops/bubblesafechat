import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database, auth } from '../firebaseConfig';
import { QRCodeCanvas } from 'qrcode.react';

const Room = () => {
  const { roomId } = useParams();
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasJoined, setHasJoined] = useState(!!localStorage.getItem('hasJoined'));
  const [isCreator, setIsCreator] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]); // Solicitações pendentes de entrada
  const [statusMessage, setStatusMessage] = useState('');
  const [isRoomLoaded, setIsRoomLoaded] = useState(false); // Verificação se a sala foi carregada
  const navigate = useNavigate();

  const shareLink = `${window.location.origin}/opensecurityroom/room/${roomId}`;

  // Verifica se o usuário é o criador da sala
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const roomRef = database.ref(`rooms/${roomId}`);
      roomRef.once('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val().creator === currentUser.uid) {
          setIsCreator(true);
        }
        setIsRoomLoaded(true); // Sala carregada
      });
    }
  }, [roomId]);

  // Carrega as mensagens da sala
  useEffect(() => {
    const messagesRef = database.ref(`rooms/${roomId}/messages`);
    messagesRef.on('value', (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const parsedMessages = Object.entries(messagesData).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setMessages(parsedMessages);
      }
    });

    return () => {
      messagesRef.off();
    };
  }, [roomId]);

  // Carrega solicitações pendentes de entrada (somente criador)
  useEffect(() => {
    if (isCreator) {
      const requestsRef = database.ref(`rooms/${roomId}/requests`);
      requestsRef.on('value', (snapshot) => {
        const requestsData = snapshot.val();
        if (requestsData) {
          const parsedRequests = Object.entries(requestsData).map(([key, value]) => ({
            id: key,
            ...value
          }));
          setPendingRequests(parsedRequests);
        }
      });
    }
  }, [isCreator, roomId]);

  // Envia mensagem para o chat
  const sendMessage = () => {
    if (message.trim()) {
      const messageRef = database.ref(`rooms/${roomId}/messages`).push();
      messageRef.set({
        text: message,
        user: userName,
        timestamp: new Date().toISOString(),
      });
      setMessage('');
    }
  };

  // Função para sair da sala
  const leaveRoom = () => {
    setStatusMessage('Você saiu da sala.');
    setTimeout(() => {
      localStorage.removeItem('hasJoined');
      navigate('/');
    }, 2000);
  };

  // Função para permitir ou negar entrada
  const handleRequest = (userId, decision) => {
    const requestRef = database.ref(`rooms/${roomId}/requests/${userId}`);

    if (decision === 'accept') {
      // Permite a entrada do usuário (adiciona o nome na lista de permitidos)
      requestRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          const allowedRef = database.ref(`rooms/${roomId}/allowedUsers/${userData.userName}`);
          allowedRef.set(true); // Adiciona à lista de usuários permitidos
        }
      });
    }

    // Remove a solicitação do usuário após aceitação ou negação
    requestRef.remove()
      .then(() => {
        setPendingRequests((prevRequests) => prevRequests.filter((req) => req.id !== userId));
      })
      .catch((error) => {
        console.error('Erro ao processar a solicitação:', error);
      });
  };

  // Solicita a entrada na sala (usuários convidados)
  const requestAccess = () => {
    const requestsRef = database.ref(`rooms/${roomId}/requests`).push();
    requestsRef.set({
      userName,
      timestamp: new Date().toISOString(),
    });
    setStatusMessage('Solicitação de entrada enviada. Aguarde aprovação.');
  };

  // Verifica se o usuário foi autorizado (usuários convidados)
  useEffect(() => {
    if (!isCreator && userName) {
      const allowedRef = database.ref(`rooms/${roomId}/allowedUsers/${userName}`);
      allowedRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
          setHasJoined(true);
          localStorage.setItem('hasJoined', 'true');
        }
      });
    }
  }, [roomId, userName]);

  // Função para excluir a sala e todos os dados do chat
  const deleteChat = () => {
    database.ref(`rooms/${roomId}`).remove() // Remove toda a sala, incluindo mensagens, solicitações, etc.
      .then(() => {
        setStatusMessage('Sala excluída com sucesso!');
        setTimeout(() => {
          navigate('/'); // Redireciona para a página de criação de salas após exclusão
        }, 2000);
      })
      .catch((error) => {
        console.error('Erro ao excluir a sala:', error);
      });
  };

  // Mostra solicitação de entrada se o usuário não foi autorizado
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

  return (
    <div>
      <h1>Sala de Chat</h1>

      {/* Exibe as solicitações de entrada pendentes para o criador da sala */}
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
        {messages.map((msg) => (
          <div key={msg.id} style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escreva sua mensagem"
      />
      <button onClick={sendMessage} disabled={!message.trim()}>
        Enviar
      </button>

      {isCreator && isRoomLoaded && ( // Verifica se a sala está carregada antes de mostrar o QR code
        <div>
          <h3>Compartilhar link do chat:</h3>
          <p>Link: <a href={shareLink}>{shareLink}</a></p>
          <QRCodeCanvas value={shareLink} size={128} />
          <button onClick={leaveRoom}>Sair</button>
          <button onClick={deleteChat}>Excluir Chat</button> {/* Novo botão para excluir chat */}
        </div>
      )}

      {statusMessage && <p style={{ color: 'green' }}>{statusMessage}</p>}
    </div>
  );
};

export default Room;
