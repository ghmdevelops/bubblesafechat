// src/components/DoorPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './DoorPage.css';
import doorSound from './sounds/open-door.mp3';
import { database } from '../firebaseConfig';
import { ref as dbRef, onValue } from 'firebase/database';

const DoorPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(true);
  const audioRef = useRef(null);
  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (roomId) {
      const roomRef = dbRef(database, `rooms/${roomId}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.val();
          setRoomName(roomData.name || 'Sala Sem Nome');

          // Exibir o Swal após obter os dados da sala
          Swal.fire({
            title: `Bem-vindo à sala ${roomData.name || 'Sala Sem Nome'}`,
            text: 'Clique na maçaneta para abrir a porta.',
            icon: 'info',
            confirmButtonText: 'Entendi',
            allowOutsideClick: false, // Impede fechar o Swal clicando fora
          });
        } else {
          // Se a sala não existir, exibir uma mensagem de erro
          Swal.fire({
            title: 'Sala Não Encontrada',
            text: 'A sala que você está tentando acessar não existe.',
            icon: 'error',
            confirmButtonText: 'Voltar',
          }).then(() => {
            navigate('/'); // Navegar de volta para a página inicial ou outra rota apropriada
          });
        }
        setLoading(false);
      });

      // Limpeza do listener quando o componente for desmontado
      return () => {
        unsubscribe();
      };
    } else {
      // Se o roomId não estiver presente na URL
      Swal.fire({
        title: 'Erro',
        text: 'Nenhuma sala identificada na URL.',
        icon: 'error',
        confirmButtonText: 'Voltar',
      }).then(() => {
        navigate('/'); // Navegar de volta para a página inicial ou outra rota apropriada
      });
      setLoading(false);
    }
  }, [roomId, navigate]);

  const openDoor = () => {
    setIsOpen(true);
    if (audioRef.current) {
      audioRef.current.play();
    }

    // Após a transição de 1.2s, navegar para a sala
    setTimeout(() => {
      navigate(`/room/${roomId}`);
    }, 1200);
  };

  if (loading) {
    return <div className="loading"></div>;
  }

  return (
    <div className={`body ${isOpen ? 'open-light' : ''}`}>
      {!isOpen && <div className="dark-overlay"></div>}
      {!isOpen && <div className="lamp"></div>}
      {!isOpen && <div className="light-beam"></div>}
      {!isOpen && <div className="door-frame"></div>}
      <div className={`door ${isOpen ? 'open' : ''}`} onClick={openDoor}>
        <div className="handle"></div>
      </div>
      {!isOpen && <div className="corridor"></div>}

      <audio ref={audioRef} src={doorSound} id="doorSound"></audio>
    </div>
  );
};

export default DoorPage;
