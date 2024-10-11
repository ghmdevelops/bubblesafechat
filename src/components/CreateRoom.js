import React, { useState, useEffect, useRef } from 'react';
import { auth, database } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Helmet } from 'react-helmet';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css';
import './CreateRoom.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPlus, faTimes, faCheck, faPowerOff, faUserCircle, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import iconPage from './img/icon-page.png';
import { EmailAuthProvider } from 'firebase/auth';

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
      title: '🔒 Proteção Máxima e Controle Total!',
      html: `<p style="text-align: left; font-size: 1em; color: #ffffff; line-height: 1.5;">
                Bem-vindo à <strong>Open Security Room</strong>, sua plataforma com o mais alto nível de <strong>privacidade</strong> e <strong>segurança</strong>. Todas as salas são protegidas por <strong>criptografia de ponta</strong>, garantindo que você permaneça completamente anônimo e no controle.
              </p>
              <p style="text-align: left; font-size: 1em; color: #ffffff; line-height: 1.5;">
                Seus dados pessoais são armazenados por no máximo <strong>24 horas</strong> e podem ser excluídos permanentemente a qualquer momento. Após esse período, realizamos um <strong>reset diário</strong> para garantir que nenhuma informação permaneça armazenada.
              </p>
              <p style="text-align: left; font-size: 1em; color: #ffffff; line-height: 1.5;">
                Você pode compartilhar suas salas com total segurança por meio de <strong>QR Code</strong> ou link, sempre mantendo o controle total sobre quem acessa. Aqui, você está no comando.
              </p>`,
      icon: 'info',
      confirmButtonText: 'Entendido!',
      customClass: {
        popup: 'swal-popup-dark',  // Classe personalizada para o popup
        confirmButton: 'btn btn-primary swal-confirm-button-dark',  // Classe para o botão
      },
      buttonsStyling: false,
      background: '#0C090A',  // Fundo escuro
      width: '800px',  // Largura maior do modal
      backdrop: `
        rgba(0, 0, 0, 0.7)
      `,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'  // Animação de entrada
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'  // Animação de saída
      }
    });

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const emailName = user.email.split('@')[0];
        setUserEmail(emailName);
        resetLastAccessTime();
      } else {
        navigate('/');
      }
    });

    const events = ['mousemove', 'keydown', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, resetLastAccessTime);
    });

    startLogoutTimer();

    return () => {
      unsubscribe();
      events.forEach((event) => {
        window.removeEventListener(event, resetLastAccessTime);
      });
      clearTimeout(logoutTimer);
    };
  }, [navigate]);

  const resetLastAccessTime = () => {
    localStorage.setItem('lastAccessTime', Date.now());
    startLogoutTimer();
  };

  const reauthenticateUser = async () => {
    const currentUser = auth.currentUser;

    try {
      const { value: password } = await Swal.fire({
        title: 'Reautenticação necessária',
        input: 'password',
        inputLabel: 'Digite sua senha para confirmar:',
        inputPlaceholder: 'Senha',
        inputAttributes: {
          autocapitalize: 'off',
          autocorrect: 'off',
          id: 'password-input'
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-secondary'
        },
        buttonsStyling: false,
        didOpen: () => {
          // Criar o checkbox de "Mostrar senha"
          const passwordInput = Swal.getInput();
          const container = Swal.getHtmlContainer();
          const inputLabel = document.querySelector('.swal2-input-label');
          if (inputLabel) {
            inputLabel.style.color = '#fff';
          }

          const checkboxLabel = document.createElement('label');
          checkboxLabel.setAttribute('for', 'show-password');
          checkboxLabel.innerHTML = 'Mostrar senha';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'd-none';
          checkbox.id = 'show-password';
          checkbox.style.marginLeft = '10px';

          container.appendChild(checkboxLabel);
          container.appendChild(checkbox);

          // Adicionar o evento para o checkbox
          checkbox.addEventListener('change', (event) => {
            if (event.target.checked) {
              passwordInput.type = 'text';
            } else {
              passwordInput.type = 'password';
            }
          });
        }
      });

      if (!password) {
        return false;
      }

      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await currentUser.reauthenticateWithCredential(credential);

      return true;
    } catch (error) {
      Swal.fire('Erro de autenticação', 'Reautenticação falhou, tente novamente.', 'error');
      return false;
    }
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser.emailVerified) {
      Swal.fire({
        title: 'Verifique seu e-mail',
        text: 'Você precisa verificar o seu e-mail antes de excluir a conta. Um e-mail de verificação foi enviado.',
        icon: 'warning',
        confirmButtonText: 'Ok'
      });

      try {
        await currentUser.sendEmailVerification();
        Swal.fire('E-mail enviado', 'Por favor, verifique seu e-mail e tente novamente.', 'info');
      } catch (error) {
        Swal.fire('Erro ao enviar e-mail', error.message, 'error');
      }
      return;
    }

    const result = await Swal.fire({
      title: 'Excluir conta?',
      text: 'Tem certeza que deseja excluir sua conta e todos os seus dados?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    });

    if (result.isConfirmed) {
      try {
        const reauthenticated = await reauthenticateUser();

        if (!reauthenticated) return;

        const userRef = database.ref(`users/${currentUser.uid}`);
        await userRef.remove();
        await currentUser.delete();

        Swal.fire('Conta excluída com sucesso!', '', 'success');
        navigate('/');
      } catch (error) {
        console.error('Erro ao excluir a conta:', error);
        Swal.fire('Erro ao excluir a conta', error.message, 'error');
      }
    }
  };

  const startLogoutTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      handleLogout();
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
      localStorage.setItem('userName', userName);

      const roomRef = database.ref('rooms').push({
        name: roomName,
        createdAt: new Date().toISOString(),
        creator: currentUser.uid,
        creatorName: userName,
        encryptionKey: encryptionKey
      });

      // Navega para a sala recém-criada
      navigate(`/room/${roomRef.key}`, { state: { roomName: roomName, encryptionKey } });
      setSuccessMessage('Sala criada com sucesso!');
      setErrorMessage('');
    } else {
      console.error('Usuário não autenticado!');
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Tem certeza?',
      text: "Você tem certeza que deseja sair?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, sair!',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.isConfirmed) {
        auth.signOut()
          .then(() => {
            localStorage.removeItem('lastAccessTime');
            navigate('/');
          })
          .catch((error) => {
            console.error('Erro ao deslogar:', error.message);
            Swal.fire('Erro!', 'Erro ao deslogar. Tente novamente mais tarde.', 'error');
          });
      }
    });
  };

  const handleConfirmName = () => {
    if (userName.trim()) {
      setIsNameConfirmed(true);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Nome inválido',
        text: 'Por favor, insira um nome de usuário válido.',
        confirmButtonText: 'Ok',
        customClass: {
          confirmButton: 'btn btn-primary',
        },
        buttonsStyling: false
      });
    }
  };

  const handleCancelName = () => {
    setIsNameConfirmed(false);
    setUserName('');
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Open Security Room - Home</title>
        <meta name="description" content="Crie uma nova sala de chat na Open Security Room." />
        <meta name="keywords" content="criar sala, chat, Open Security Room" />
        <meta name="author" content="Open Security Room" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
      </Helmet>

      <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
          <div class="container-fluid">
            <a className="navbar-brand" href="#"><img src={iconPage} alt="OpenSecurityRoom" />Open Security Room</a>
            <button class="navbar-toggler bg-black" type="button" data-toggle="collapse" data-target="#navbarCollapse"
              aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
              <ul className="navbar-nav ms-auto mb-2 mb-md-0">
                <li class="nav-item">
                  <button className="btn btn-primary" onClick={deleteAccount}>
                    Excluir Conta e Todos os Dados
                  </button>
                  <button className="logout-button btn btn-danger" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faPowerOff} />
                  </button>
                </li>
              </ul>
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
              <FontAwesomeIcon icon={faUserCircle} />
              <span className='ms-1 mb-1'>
                Insira o seu nick
              </span>
              <div className="input-group mb-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="ex: Qu@ntumJumperTest2"
                  className="form-control mb-1"
                />
              </div>
            </label>
            <button className="btn btn-success" style={{ height: '40px', width: '46px' }} onClick={handleConfirmName} disabled={!userName.trim()}>
              <FontAwesomeIcon icon={faCheck} />
            </button>
          </div>
        ) : (
          <>
            <label>
              <span>
                <FontAwesomeIcon icon={faDoorOpen} />
              </span>
              <span className='ms-2'>
                Insira o nome da sala
              </span>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="ex: TurmaCerveja"
                className="form-control mb-3"
              />
            </label>
            <button className="btn btn-success" onClick={createRoom} style={{ height: '40px', width: '46px' }} disabled={!roomName.trim() || loading}>
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="me-2" spin />
                  Criando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} />                </>
              )}
            </button>

            <button className="btn btn-danger cancroom" style={{ width: '46px' }} onClick={handleCancelName}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </>
        )}

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default CreateRoom;
