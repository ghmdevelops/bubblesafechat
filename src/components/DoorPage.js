// src/components/DoorPage.js
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DoorPage.css'; // Certifique-se de que o CSS está corretamente importado
import doorSound from './sounds/open-door.mp3'; // Caminho correto para o arquivo de áudio

const DoorPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef(null);
  const { roomId } = useParams();
  const navigate = useNavigate();

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
