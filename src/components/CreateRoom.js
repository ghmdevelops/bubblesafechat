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
import { faLock, faUserShield, faShieldAlt, faEye, faSpinner, faPlus, faTimes, faCheck, faPowerOff, faUserCircle, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import iconPage from './img/icon-menu.png';
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
  const [displayName, setDisplayName] = useState('');

  const LOGOUT_TIMEOUT = 60 * 60 * 1000;
  let logoutTimer;

  useEffect(() => {
    const showProtectionMessage = () => {
      const lastShown = localStorage.getItem('lastProtectionMessageShown');
      const now = new Date();

      if (!lastShown || (now - new Date(lastShown)) > 3 * 24 * 60 * 60 * 1000) {
        Swal.fire({
          title: '🔒 Proteção Máxima e Controle Total!',
          html: `<p style="text-align: left; font-size: 1em; color: #ffffff; line-height: 1.5;">
                    Bem-vindo à <strong>Bubble Safe Chat</strong>, sua plataforma com o mais alto nível de <strong>privacidade</strong> e <strong>segurança</strong>. Todas as salas são protegidas por <strong>criptografia de ponta</strong>, garantindo que você permaneça completamente anônimo e no controle.
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
            popup: 'swal-popup-dark',
          },
          background: '#0C090A',
          width: '800px',
          backdrop: `rgba(0, 0, 0, 0.7)`,
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          }
        }).then(() => {
          // Atualiza a data da última exibição
          localStorage.setItem('lastProtectionMessageShown', now);
        });
      }
    };

    showProtectionMessage();

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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(user.displayName || '');
      setUserName('');
    }
  }, []);

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
        didOpen: () => {
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

      navigate(`/avatar-selection`, { state: { roomName: roomRef.key, encryptionKey } });
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
      confirmButtonText: 'Sim, sair!',
      cancelButtonText: 'Cancelar',
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
        title: 'Nick inválido',
        text: 'Por favor, insira um nome de nick válido.',
        confirmButtonText: 'Ok',
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
        <title>Bubble Safe Chat - Rooms</title>
        <meta name="description" content="Entre no Bubble Safe Chat para criar ou acessar salas de chat seguras e privadas. Junte-se à comunidade e proteja suas conversas online." />
        <meta name="keywords" content="login, registro, chat seguro, privacidade, criptografia, comunidade online, segurança digital" />
        <meta name="author" content="Bubble Safe Chat" />
        <meta property="og:title" content='Bubble Safe Chat - Login Seguro' />
        <meta property="og:description" content="Participe da Bubble Safe Chat para criar ou acessar salas de chat criptografadas. Segurança e privacidade são prioridades." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="URL_da_imagem_de_visualização" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content='Bubble Safe Chat - Login Seguro' />
        <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com segurança máxima." />
        <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
        <link rel="canonical" href={window.location.href} />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
      </Helmet>

      <header>
        <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-black">
          <div class="container-fluid">
            <img
              className="navbar-brand img-fluid responsive-img"
              src={iconPage}
              alt="OpenSecurityRoom"
            />
            <button class="navbar-toggler bg-black" type="button" data-toggle="collapse" data-target="#navbarCollapse"
              aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
              <ul className="navbar-nav ms-auto mb-2 mb-md-0">
                <li class="nav-item">
                  <button className="btn btn-outline-info" onClick={deleteAccount}>
                    Excluir Conta e Todos os Dados
                  </button>
                  <button className="logout-button btn btn-outline-danger" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faPowerOff} />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div className="container">
        {!isNameConfirmed && <h2>Bem-vindo, {displayName}
          <h1>Digite um nick que combine com você</h1>
          <ul className="benefits-list mt-2">
            <li className='mb-3'>
              <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
              Segurança robusta que garante a privacidade das suas conversas
            </li>
            <li className='mb-3'>
              <FontAwesomeIcon icon={faEye} className="me-2" />
              Transparência total no uso e gerenciamento dos seus dados
            </li>
          </ul>
        </h2>}

        {!isNameConfirmed ? (
          <div>
            <label>
              <span className='ms-1 mb-1'>
                Escolha um apelido que represente você
              </span>
              <div className="input-group mb-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="ex: Qu@ntumJumper13"
                  className="form-control w-100"
                />
                <button
                  className="btn btn-outline-info w-100 w-md-auto"
                  onClick={handleConfirmName}
                  disabled={!userName.trim()}>
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Confirmar
                </button>
              </div>
            </label>

          </div>
        ) : (
          <>
            <h1>Criar uma Sala</h1>
            <ul className="benefits-list mt-2">
              <li className='mb-2'>
                <FontAwesomeIcon icon={faLock} className="me-2" />
                Não coletamos ou compartilhamos seus dados pessoais. Você tem controle total sobre as informações que decide compartilhar
              </li>
              <li className='mb-3'>
                <FontAwesomeIcon icon={faUserShield} className="me-2" />
                Gerenciamento de permissões: Você pode controlar quem pode entrar na sua sala e quem pode participar das conversas
              </li>
            </ul>

            <label>
              <span className='ms-2'>
                Escolha um nome exclusivo para a sua sala
              </span>
              <div className="input-group mb-2">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="ex: TurmaCerveja"
                  className="form-control mb-3"
                />
                <button className="btn btn-outline-info w-100 w-md-auto" onClick={createRoom} disabled={!roomName.trim() || loading}>
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="me-2" spin />
                      Criando...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlus} />                </>
                  )} Confirmar
                </button>
                <button className="btn btn-outline-danger w-100 w-md-auto cancroom" onClick={handleCancelName}>
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              </div>
            </label>
          </>
        )}

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default CreateRoom;
