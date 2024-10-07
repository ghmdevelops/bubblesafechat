import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const emailName = user.email.split('@')[0];
        setUserEmail(emailName);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const generateEncryptionKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString();
  };

  const createRoom = () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
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
    } else {
      console.error('Usuário não autenticado!');
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
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

  return (
    <div>
      <h2>Bem-vindo, {userEmail}</h2>
      <button onClick={handleLogout}>Logout</button>
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
          <button onClick={handleConfirmName}>Confirmar Nome</button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Nome da Sala"
          />
          <button onClick={createRoom}>Criar Sala</button>
        </>
      )}
    </div>
  );
};

export default CreateRoom;
