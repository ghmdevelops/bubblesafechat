import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controle de carregamento
  const [successMessage, setSuccessMessage] = useState(''); // Mensagem de sucesso
  const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro
  const navigate = useNavigate();

  const LOGOUT_TIMEOUT = 60 * 60 * 1000; // 1 hora em milissegundos

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const emailName = user.email.split('@')[0];
        setUserEmail(emailName);
        resetLastAccessTime(); // Atualiza o horário do último acesso
      } else {
        navigate('/');
      }
    });

    const events = ['mousemove', 'keydown', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetLastAccessTime);
    });

    return () => {
      unsubscribe();
      events.forEach((event) => {
        window.removeEventListener(event, resetLastAccessTime);
      });
    };
  }, [navigate]);

  const resetLastAccessTime = () => {
    localStorage.setItem('lastAccessTime', Date.now()); // Armazena o horário atual
  };

  const generateEncryptionKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
  };

  const createRoom = () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      setLoading(true); // Inicia o carregamento
      const encryptionKey = generateEncryptionKey();
      sessionStorage.setItem('encryptionKey', encryptionKey);
      localStorage.setItem('userName', userName); // Salva o nome do usuário

      // Cria uma nova sala no banco de dados
      const roomRef = database.ref('rooms').push({
        name: roomName,
        createdAt: new Date().toISOString(),
        creator: currentUser.uid,
        creatorName: userName, // Adiciona o nome do criador junto com o ID
        encryptionKey: encryptionKey
      });

      // Navega para a sala recém-criada
      navigate(`/room/${roomRef.key}`, { state: { roomName: roomName, encryptionKey } });
      setSuccessMessage('Sala criada com sucesso!'); // Mensagem de sucesso
      setErrorMessage(''); // Limpa mensagens de erro
    } else {
      console.error('Usuário não autenticado!');
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        localStorage.removeItem('lastAccessTime'); // Limpa o horário do último acesso
        navigate('/');
      })
      .catch((error) => {
        console.error('Erro ao deslogar:', error.message);
      });
  };

  const handleConfirmName = () => {
    if (userName.trim()) {
      setIsNameConfirmed(true);
    } else {
      alert('Por favor, insira um nome de usuário válido.');
    }
  };

  // Função para cancelar a confirmação do nome
  const handleCancelName = () => {
    setIsNameConfirmed(false);
    setUserName(''); // Limpa o campo de nome
  };

  return (
    <div>
      <h2>Bem-vindo, {userEmail}</h2>
      {!isNameConfirmed && <button onClick={handleLogout}>Logout</button>} {/* Logout apenas quando o nome não estiver confirmado */}
      <h1>Criar uma Sala</h1>

      {!isNameConfirmed ? (
        <div>
          <p>Por favor, insira o seu novo nome de usuário para continuar:</p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu novo nome de usuário"
          />
          <button onClick={handleConfirmName} disabled={!userName.trim()}>Confirmar Nome</button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)} // Atualiza o nome da sala
            placeholder="Nome da Sala"
          />
          <button onClick={createRoom} disabled={!roomName.trim() || loading}>
            {loading ? 'Criando...' : 'Criar Sala'}
          </button> {/* Habilita apenas se o nome da sala não estiver vazio */}
          <button onClick={handleCancelName}>Cancelar</button> {/* Botão de Cancelar na seção de nome da sala */}
        </>
      )}

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>} {/* Mensagem de sucesso */}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Mensagem de erro */}
    </div>
  );
};

export default CreateRoom;
