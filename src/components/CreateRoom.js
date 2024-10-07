import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [rooms, setRooms] = useState([]);  // Para armazenar as salas do usuário
  const navigate = useNavigate();

  // Monitorar o usuário autenticado e carregar salas criadas por ele
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        
        // Carregar as salas criadas pelo usuário com UID do usuário autenticado
        const roomsRef = database.ref('rooms').orderByChild('creator').equalTo(user.uid);
        roomsRef.on('value', (snapshot) => {
          const roomsData = snapshot.val();
          if (roomsData) {
            const parsedRooms = Object.entries(roomsData).map(([key, value]) => ({
              id: key,
              ...value
            }));
            setRooms(parsedRooms);  // Atualiza o estado com as salas encontradas
          } else {
            setRooms([]);  // Nenhuma sala encontrada
          }
        });
      } else {
        navigate('/');  // Redireciona para login se o usuário não estiver autenticado
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const createRoom = () => {
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      const roomRef = database.ref('rooms').push({
        name: roomName,
        createdAt: new Date().toISOString(),
        creator: currentUser.uid  // Certifique-se de que este campo está sendo salvo
      });
  
      navigate(`/room/${roomRef.key}`, { state: { roomName: roomName } });
    } else {
      console.error('Usuário não autenticado!');
    }
  };

  const deleteRoom = (roomId) => {
    database.ref(`rooms/${roomId}`).remove()
      .then(() => {
        console.log('Sala excluída com sucesso.');
      })
      .catch((error) => {
        console.error('Erro ao excluir a sala:', error);
      });
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

      <h2>Suas Salas Criadas:</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            <span>{room.name}</span>
            <button onClick={() => navigate(`/room/${room.id}`, { state: { roomName: room.name } })}>
              Entrar
            </button>
            <button onClick={() => deleteRoom(room.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreateRoom;
