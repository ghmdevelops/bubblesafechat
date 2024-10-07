import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // useNavigate substitui useHistory
import { db } from './firebaseConfig';

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();  // useNavigate substitui useHistory

  const createRoom = async () => {
    if (roomName) {
      const roomRef = await db.collection('rooms').add({
        name: roomName,
        createdAt: new Date(),
      });

      navigate(`/room/${roomRef.id}`);  // Redireciona para a sala criada
    }
  };

  return (
    <div className="home-container">
      <h1>Create a Chat Room</h1>
      <input
        type="text"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        placeholder="Room Name"
      />
      <button onClick={createRoom}>Create Room</button>
    </div>
  );
};

export default Home;
