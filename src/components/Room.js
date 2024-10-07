import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { database, auth } from '../firebaseConfig';
import { QRCodeCanvas } from 'qrcode.react';  // Usar QRCodeCanvas para o QR code

const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const roomName = location.state?.roomName || "Sala";
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');  // Pegar o nome do localStorage
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasJoined, setHasJoined] = useState(!!localStorage.getItem('hasJoined'));  // Verificar se o usuário já entrou na sala
  const [isCreator, setIsCreator] = useState(false);
  const navigate = useNavigate();

  // Link da sala que será compartilhado com o QR Code
  const shareLink = `${window.location.origin}/room/${roomId}`;

  // Verificar se o usuário é o criador da sala
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

  // Carregar mensagens em tempo real
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

  // Função para enviar mensagem
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

  // Função para sair da sala (apenas para o criador)
  const leaveRoom = () => {
    localStorage.removeItem('hasJoined');  // Remover o estado de entrada
    navigate('/create-room');  // Voltar para a página de criação de salas
  };

  // Função para excluir a sala (apenas para o criador)
  const deleteRoom = () => {
    database.ref(`rooms/${roomId}`).remove()
      .then(() => {
        console.log("Sala excluída com sucesso");
        localStorage.removeItem('hasJoined');  // Remover o estado de entrada ao excluir a sala
        localStorage.removeItem('userName');  // Remover o nome do usuário ao excluir a sala
        navigate('/create-room');
      })
      .catch((error) => {
        console.error("Erro ao excluir a sala:", error);
      });
  };

  // Se o usuário ainda não entrou no chat, exibir a tela de entrada de nome
  if (!hasJoined) {
    return (
      <div>
        <h1>{roomName}</h1>
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
            localStorage.setItem('hasJoined', 'true');  // Persistir estado de entrada no localStorage
            localStorage.setItem('userName', userName);  // Armazenar o nome do usuário localmente
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
      <h1>{roomName} - Chat</h1>

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
          <button onClick={leaveRoom}>Sair</button>
          <button onClick={deleteRoom}>Excluir Sala</button>

          {/* Mostrar o QR Code para compartilhar */}
          <div>
            <h3>Compartilhar link do chat:</h3>
            <p>Link: <a href={shareLink}>{shareLink}</a></p>
            <QRCodeCanvas value={shareLink} size={128} /> {/* Usar QRCodeCanvas */}
          </div>
        </div>
      ) : (
        <p>Bem-vindo(a) ao chat! Apenas o criador pode sair ou excluir a sala.</p>
      )}
    </div>
  );
};

export default Room;
