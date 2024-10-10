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
import { faPowerOff, faUserCircle, } from '@fortawesome/free-solid-svg-icons';
import googleIcon from './img/icon-page.png';
import { EmailAuthProvider } from 'firebase/auth'; // Importa o provedor de autenticação de email

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState('');
  const [isNameConfirmed, setIsNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const LOGOUT_TIMEOUT = 60 * 60 * 1000;
  let logoutTimer;

  useEffect(() => {
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

  const reauthenticateUser = async () => {
    const currentUser = auth.currentUser;
    const credential = EmailAuthProvider.credential(currentUser.email, prompt('Digite sua senha para confirmar:'));

    try {
      await currentUser.reauthenticateWithCredential(credential);
      return true;
    } catch (error) {
      Swal.fire('Erro de autenticação', 'Reautenticação falhou, tente novamente.', 'error');
      return false;
    }
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;

    // Verifica se o e-mail foi verificado
    if (!currentUser.emailVerified) {
      Swal.fire({
        title: 'Verifique seu e-mail',
        text: 'Você precisa verificar o seu e-mail antes de excluir a conta. Um e-mail de verificação foi enviado.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });

      // Envia um e-mail de verificação
      currentUser.sendEmailVerification()
        .then(() => {
          Swal.fire('E-mail enviado', 'Por favor, verifique seu e-mail e tente novamente.', 'info');
        })
        .catch((error) => {
          Swal.fire('Erro ao enviar e-mail', error.message, 'error');
        });
      return; // Para a função se o e-mail não foi verificado
    }

    if (window.confirm('Tem certeza que deseja excluir sua conta e todos os seus dados?')) {
      try {
        const reauthenticated = await reauthenticateUser(); // Primeiro reautentica o usuário
        if (!reauthenticated) return; // Se a reautenticação falhar, aborta a operação

        // Exclui os dados do usuário no banco de dados (Realtime Database ou Firestore)
        const userRef = database.ref(`users/${currentUser.uid}`);
        await userRef.remove(); // Remove os dados

        // Exclui a conta do Firebase Authentication
        await currentUser.delete();

        Swal.fire('Conta excluída com sucesso!', '', 'success');
        navigate('/'); // Redireciona para a página inicial após exclusão
      } catch (error) {
        console.error('Erro ao excluir a conta:', error);
        Swal.fire('Erro ao excluir a conta', error.message, 'error');
      }
    }
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
            <a className="navbar-brand" href="#"><img src={googleIcon} alt="OpenSecurityRoom" />Open Security Room</a>
            <div id="navbarCollapse">
              <button className="btn btn-danger mt-3" onClick={deleteAccount}>
                Excluir Conta e Todos os Dados
              </button>
              <button className="logout-button btn btn-danger" onClick={handleLogout}>
                <FontAwesomeIcon icon={faPowerOff} />{/* Adiciona o ícone */}
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="container" style={{ marginTop: '70px' }}>
        {!isNameConfirmed && <h2>Bem-vindo, {userEmail}</h2>}

        <h1>Criar uma Sala</h1>

        {!isNameConfirmed ? (
          <div>
            <label>
              <span>
                <FontAwesomeIcon icon={faUserCircle} />
                Insira o seu nick ex: Joao9302
              </span>
              <div className="input-group mb-3">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Digite seu novo nome de usuário"
                  className="form-control" // Adiciona a classe do Bootstrap
                />
              </div>
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
