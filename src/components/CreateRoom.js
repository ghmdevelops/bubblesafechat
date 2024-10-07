import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js'; // Importando a biblioteca de criptografia

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  // Monitorar o usuário autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigate('/');  // Redireciona para login se o usuário não estiver autenticado
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Função para gerar uma chave de criptografia para a sala
  const generateEncryptionKey = () => {
    return CryptoJS.lib.WordArray.random(16).toString(); // Gera uma chave de 128 bits
  };

  const createRoom = () => {
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      const encryptionKey = generateEncryptionKey(); // Gera a chave de criptografia
      sessionStorage.setItem('encryptionKey', encryptionKey); // Armazena no sessionStorage

      const roomRef = database.ref('rooms').push({
        name: roomName,
        createdAt: new Date().toISOString(),
        creator: currentUser.uid,  // Certifique-se de que este campo está sendo salvo
        encryptionKey: encryptionKey // Salva a chave de criptografia no banco de dados (opcional)
      });

      navigate(`/room/${roomRef.key}`, { state: { roomName: roomName, encryptionKey } }); // Passa a chave para a sala
    } else {
      console.error('Usuário não autenticado!');
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        navigate('/');  // Redireciona para login após logout
      })
      .catch((error) => {
        console.error('Erro ao deslogar:', error.message);
      });
  };

  return (
    <div>
      <h2>Bem-vindo, {userEmail}</h2>
      <button onClick={handleLogout}>Logout</button>
      <h1>Criar uma Sala</h1>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Nome da Sala"
      />
      <button onClick={createRoom}>Criar Sala</button>
    </div>
  );
};

export default CreateRoom;
