import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Helmet } from 'react-helmet';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa o CSS do Bootstrap
import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css';
import './CreateRoom.css'; // Importe o CSS personalizado
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons'; 
import googleIcon from './img/icon-page.png';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const LOGOUT_TIMEOUT = 60 * 60 * 1000; // 1 hora em milissegundos
  let logoutTimer; // Timer para controle de logout

  useEffect(() => {
    // Alerta ao abrir ou recarregar a página
    Swal.fire({
      title: 'Informações Importantes!',
      text: 'Certifique-se de que seu nome de usuário é apropriado antes de criar uma sala.',
      icon: 'info',
      confirmButtonText: 'Ok'
    });

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const emailName = user.email.split('@')[0];
        setUserEmail(emailName);
        resetLastAccessTime(); // Atualiza o horário do último acesso
      } else {
        navigate('/'); // Redireciona para o login se não estiver autenticado
      }
    });

    const events = ['mousemove', 'keydown', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetLastAccessTime);
    });

    // Inicia o timer de logout
    startLogoutTimer();

    return () => {
      unsubscribe();
      events.forEach((event) => {
        window.removeEventListener(event, resetLastAccessTime);
      });
      clearTimeout(logoutTimer); // Limpa o timer ao desmontar
    };
  }, [navigate]);

  const resetLastAccessTime = () => {
    localStorage.setItem('lastAccessTime', Date.now()); // Armazena o horário atual
    startLogoutTimer(); // Reinicia o timer de logout
  };

  const startLogoutTimer = () => {
    clearTimeout(logoutTimer); // Limpa o timer anterior
    logoutTimer = setTimeout(() => {
      handleLogout(); // Chama a função de logout após o tempo limite
    }, LOGOUT_TIMEOUT);
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
    if (window.confirm('Você tem certeza que deseja sair?')) { // Confirmação antes de sair
      auth.signOut()
        .then(() => {
          localStorage.removeItem('lastAccessTime'); // Limpa o horário do último acesso
          navigate('/'); // Redireciona para a página de login
        })
        .catch((error) => {
          console.error('Erro ao deslogar:', error.message);
        });
    }
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
    <div className="auth-container">
      <Helmet>
        <title>Open Security Room - Home</title>
        <meta name="description" content="Crie uma nova sala de chat na Open Security Room." />
        <meta name="keywords" content="criar sala, chat, Open Security Room" />
        <meta name="author" content="Open Security Room" />
      </Helmet>

      <header>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
          <div className="container-fluid">
            <a className="navbar-brand" href="#"><img src={googleIcon} alt="OpenSecurityRoom"/>Open Security Room</a>
            <div id="navbarCollapse">
            <button className="logout-button btn btn-danger" onClick={handleLogout}>
              <FontAwesomeIcon icon={faPowerOff} />{/* Adiciona o ícone */}
            </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="container" style={{ marginTop: '70px' }}> {/* Espaço para a navbar fixa */}
        {/* Condição para exibir a mensagem de boas-vindas apenas se o nome não estiver confirmado */}
        {!isNameConfirmed && <h2>Bem-vindo, {userEmail}</h2>}

        <h1>Criar uma Sala</h1>

        {!isNameConfirmed ? (
          <div>
            <label>
              Insira o seu nome de usuário para continuar
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Digite seu novo nome de usuário"
                className="form-control mb-3" // Adiciona a classe do Bootstrap
              />
            </label>
            <button className="btn btn-primary mx-2" onClick={handleConfirmName} disabled={!userName.trim()}>Confirmar Nome</button>
          </div>
        ) : (
          <>
            <label>
              Insira o nome da sala
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)} // Atualiza o nome da sala
                placeholder="Nome da Sala"
                className="form-control mb-3" // Adiciona a classe do Bootstrap
              />
            </label>
            <button className="btn btn-primary mx-2" onClick={createRoom} disabled={!roomName.trim() || loading}>
              {loading ? 'Criando...' : 'Criar Sala'}
            </button>
            <button className="btn btn-secondary" onClick={handleCancelName}>Cancelar</button> {/* Botão de Cancelar */}
          </>
        )}

        {successMessage && <p className="success-message">{successMessage}</p>} {/* Mensagem de sucesso */}
        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mensagem de erro */}
      </div>
    </div>
  );
};

export default CreateRoom;
