import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // useNavigate substitui useHistory
import { db } from './firebaseConfig';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();  // useNavigate substitui useHistory

  useEffect(() => {
    const unsubscribe = db
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('createdAt')
      .onSnapshot((snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (newMessage) {
      await db.collection('rooms').doc(roomId).collection('messages').add({
        text: newMessage,
        createdAt: new Date(),
      });
      setNewMessage('');
    }
  };

  const deleteRoom = async () => {
    try {
      // Excluir todas as mensagens da sala
      const messagesRef = db.collection('rooms').doc(roomId).collection('messages');
      const messagesSnapshot = await messagesRef.get();
      const batch = db.batch();
      messagesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Excluir a sala
      await db.collection('rooms').doc(roomId).delete();

      // Redirecionar para a página inicial após excluir
      navigate('/');  // Redireciona para a página inicial
    } catch (error) {
      console.error('Erro ao deletar a sala: ', error);
    }
  };

  return (
    <div className="chatroom-container">
      <h1>Chat Room</h1>
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
      <br />
      {/* Botão para excluir a sala */}
      <button onClick={deleteRoom} className="delete-button">
        Delete Room
      </button>
    </div>
  );
};

export default ChatRoom;
