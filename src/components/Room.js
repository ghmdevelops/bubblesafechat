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
  const [statusMessage, setStatusMessage] = useState(''); 
  const navigate = useNavigate();

  const shareLink = `${window.location.origin}/opensecurityroom/room/${roomId}`;

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const roomRef = database.ref(`rooms/${roomId}`);
      roomRef.once('value', (snapshot) => {
        if (snapshot.exists() && snapshot.val().creator === currentUser.uid) {
          setIsCreator(true);
        }
      });
    }
  }, [roomId]);

  useEffect(() => {
    const messagesRef = database.ref(`rooms/${roomId}/messages`);
    
    messagesRef.on('value', (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const parsedMessages = Object.entries(messagesData).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setMessages(parsedMessages); // Corrigido: Adicionado ponto e vírgula
      }
    });

    return () => {
      messagesRef.off();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (message.trim()) {
      const messageRef = database.ref(`rooms/${roomId}/messages`).push();
      messageRef.set({
        text: message,
        user: userName,
        timestamp: new Date().toISOString()
      });
      setMessage('');
    }
  };

  // Função para garantir que a mensagem de saída seja enviada apenas quando o usuário fechar o link, não ao recarregar a página
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      sessionStorage.setItem('isReloading', 'true'); // Indica que a página está recarregando
    };

    const handleUnload = () => {
      const isReloading = sessionStorage.getItem('isReloading') === 'true';

      // Só envia a mensagem se não for um reload
      if (!isReloading) {
        const messageRef = database.ref(`rooms/${roomId}/messages`).push();
        messageRef.set({
          text: `${userName} saiu da sala.`,
          user: 'Sistema',
          timestamp: new Date().toISOString()
        });
      }

      sessionStorage.removeItem('isReloading'); // Remove a flag de reload
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [roomId, userName]);

  // Função para excluir a sala e limpar todos os dados
  const deleteRoom = () => {
    // Remove toda a referência da sala, incluindo mensagens e usuários
    database.ref(`rooms/${roomId}`).remove()
      .then(() => {
        setStatusMessage("A sala e todos os dados foram excluídos com sucesso!");
        setTimeout(() => {
          localStorage.removeItem('hasJoined');
          localStorage.removeItem('userName');
          navigate('/');  // Redirecionar para a página de criação de salas após 2 segundos
        }, 2000);
      })
      .catch((error) => {
        console.error("Erro ao excluir a sala:", error);
      });
  };

  // Função para sair da sala
  const leaveRoom = () => {
    setStatusMessage("Você saiu da sala.");
    setTimeout(() => {
      localStorage.removeItem('hasJoined');
      navigate('/');
    }, 2000); 
  };

  if (!hasJoined) {
    return (
      <div>
        <h1>Bem-vindo à sala: {roomId}</h1>
        <p>Por favor, insira seu nome para entrar no chat:</p>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Digite seu nome"
        />
        <button
          onClick={() => {
            setHasJoined(true);
            localStorage.setItem('hasJoined', 'true');
            localStorage.setItem('userName', userName);
          }}
          disabled={!userName.trim()}
        >
          Entrar no chat
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Sala de Chat</h1>

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

      {isCreator ? (
        <div>
          <h3>Compartilhar link do chat:</h3>
          <p>Link: <a href={shareLink}>{shareLink}</a></p>
          <QRCodeCanvas value={shareLink} size={128} />
          <button onClick={leaveRoom}>Sair</button>
          <button onClick={deleteRoom}>Excluir Sala</button>
        </div>
      ) : (
        <p>Você está no chat. Apenas o criador pode sair ou excluir a sala.</p>
      )}

      {statusMessage && <p style={{ color: 'green' }}>{statusMessage}</p>}
    </div>
  );
};

export default Room;
