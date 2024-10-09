import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import logo from './img/name.png';
import icon from './img/icon-page.png';
import googleIcon from './img/icon-google.png';
import './AuthExample.css';

library.add(faGoogle);

const AuthExample = () => {
    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [registrationMessage, setRegistrationMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginAttempts, setLoginAttempts] = useState(0); // Contador de tentativas de login
    const [isLockedOut, setIsLockedOut] = useState(false); // Estado para controle de bloqueio
    const [lockoutMessage, setLockoutMessage] = useState(''); // Mensagem de bloqueio
    const [passwordResetRequested, setPasswordResetRequested] = useState(false); // Estado para controle de solicitação de redefinição de senha
    const navigate = useNavigate();

    useEffect(() => {
        // Verifica se o usuário está bloqueado
        const storedLockout = localStorage.getItem('isLockedOut');

        if (storedLockout === 'true') {
            setIsLockedOut(true);
            setLockoutMessage('Sua conta está bloqueada. Redefina sua senha para acessar novamente.');
        }

        const storedAttempts = localStorage.getItem('loginAttempts');
        if (storedAttempts) {
            setLoginAttempts(parseInt(storedAttempts));
        }
    }, []);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);

        try {
            await signInWithPopup(auth, provider);
            navigate('/'); // Redireciona para a página principal após o login
        } catch (error) {
            console.error('Erro ao fazer login com Google:', error);
            setErrorMessage('Erro ao fazer login com Google. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setRegistrationMessage('');

        if (!firstName.trim()) {
            setErrorMessage('Por favor, insira seu primeiro nome.');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setErrorMessage('Por favor, insira um e-mail válido.');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('As senhas não correspondem. Tente novamente.');
            return;
        }

        setIsLoading(true);
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;

                user.sendEmailVerification()
                    .then(() => {
                        setRegistrationMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta antes de fazer login.');
                        setTimeout(() => {
                            setIsLogin(true);
                            setRegistrationMessage('');
                        }, 5000);
                    })
                    .catch(error => {
                        setErrorMessage('Erro ao enviar e-mail de verificação.');
                    });

                auth.signOut();
            })
            .catch(error => {
                if (error.code === 'auth/email-already-in-use') {
                    setErrorMessage('Esse e-mail já está em uso. Tente outro.');
                } else if (error.code === 'auth/invalid-email') {
                    setErrorMessage('E-mail inválido.');
                } else if (error.code === 'auth/weak-password') {
                    setErrorMessage('Senha fraca. Escolha uma senha mais forte.');
                } else {
                    setErrorMessage('Erro ao registrar. Verifique as informações e tente novamente.');
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Verifica se a conta está bloqueada
        if (isLockedOut || passwordResetRequested) {
            setErrorMessage('Você deve redefinir sua senha antes de tentar fazer login.');
            return; // Não permite o login se a conta estiver bloqueada ou se a senha foi solicitada para redefinição
        }

        setIsLoading(true);
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;

                if (user.emailVerified) {
                    navigate('/');
                } else {
                    setErrorMessage('Por favor, verifique seu e-mail antes de fazer login.');
                    auth.signOut();
                }
            })
            .catch(error => {
                const attemptsLeft = 4 - loginAttempts; // 5 tentativas no total (0 a 4)
                setLoginAttempts(prev => prev + 1); // Incrementa tentativas de login
                localStorage.setItem('loginAttempts', loginAttempts + 1); // Armazena o número de tentativas

                if (loginAttempts + 1 >= 5) { // Se já excedeu 5 tentativas
                    setIsLockedOut(true);
                    localStorage.setItem('isLockedOut', 'true'); // Armazena que a conta está bloqueada
                    setErrorMessage('Você excedeu o número de tentativas de login. Redefina sua senha.');
                } else {
                    if (error.code === 'auth/wrong-password') {
                        setErrorMessage(`Senha incorreta. Você tem ${attemptsLeft} tentativas restantes. Considere redefinir sua senha.`);
                    } else if (error.code === 'auth/user-not-found') {
                        setErrorMessage('E-mail não encontrado. Verifique se o e-mail está correto.');
                    } else if (error.code === 'auth/invalid-email') {
                        setErrorMessage('E-mail inválido. Verifique o formato.');
                    } else {
                        setErrorMessage('Erro ao fazer login. Verifique as credenciais e tente novamente.');
                    }
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handlePasswordReset = () => {
        if (!email) {
            setErrorMessage('Por favor, insira seu e-mail para redefinir a senha.');
            return;
        }

        auth.sendPasswordResetEmail(email)
            .then(() => {
                setResetMessage('E-mail de recuperação de senha enviado. Verifique sua caixa de entrada ou lixo eletrônico.');
                setErrorMessage('');
                setPasswordResetRequested(true); // Indica que o pedido de redefinição de senha foi feito

                // Redefinir estado de bloqueio após o envio do e-mail
                setIsLockedOut(false);
                localStorage.removeItem('isLockedOut'); // Remove o bloqueio
                localStorage.removeItem('loginAttempts'); // Reseta tentativas
            })
            .catch(error => {
                if (error.code === 'auth/user-not-found') {
                    setErrorMessage('E-mail não encontrado. Verifique se o e-mail está correto.');
                } else if (error.code === 'auth/invalid-email') {
                    setErrorMessage('E-mail inválido. Verifique o formato.');
                } else {
                    setErrorMessage('Erro ao enviar o e-mail de recuperação. Tente novamente mais tarde.');
                }
            });
    };

    return (
        <div className="auth-container">
            <Helmet>
                <title>{isLogin ? 'Open Security Room - Login' : 'Open Security Room - Registro'}</title>
                <meta name="description" content="Faça login para acessar suas salas de chat na Open Security Room ou crie uma nova conta para se juntar à comunidade." />
                <meta name="keywords" content="login, registro, chat, segurança, comunidade" />
                <meta name="author" content="Open Security Room" />
                <meta property="og:title" content={isLogin ? 'Open Security Room - Login' : 'Open Security Room - Registro'} />
                <meta property="og:description" content="Acesse suas salas de chat ou crie uma nova conta na Open Security Room." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="URL_da_imagem_de_visualização" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={isLogin ? 'Open Security Room - Login' : 'Open Security Room - Registro'} />
                <meta name="twitter:description" content="Acesse suas salas de chat ou crie uma nova conta na Open Security Room." />
                <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
                <link rel="canonical" href={window.location.href} />
            </Helmet>

            <img id="icon-img" src={icon} alt="OpenSecurityRoom" />
            <img src={logo} alt="OpenSecurityRoom" />
            <h1>{isResetPassword ? 'Redefinir Senha' : (isLogin ? 'Login' : 'Registrar')}</h1>

            {!isResetPassword ? (
                <form onSubmit={isLogin ? handleLogin : handleRegister}>
                    {!isLogin && (
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Primeiro Nome"
                            required
                        />
                    )}

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        autoComplete="email"
                    />

                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                        }}
                        placeholder="Senha"
                        required
                        autoComplete={isLogin ? "current-password" : "new-password"}
                    />

                    {!isLogin && (
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar Senha"
                            required
                            autoComplete="new-password"
                        />
                    )}

                    <label id='check'>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        Mostrar senha
                    </label>

                    <button type="submit" disabled={isLoading || isLockedOut}>
                        {isLoading ? 'Carregando...' : (isLogin ? 'Login' : 'Registrar')}
                    </button>

                    {isLogin && (
                        <button type="button" onClick={handleGoogleLogin} disabled={isLoading || isLockedOut}>
                            {isLoading ? ' Carregando...' : <><img src={googleIcon} alt="Google" style={{ width: '20px', marginRight: '5px' }} /> Cadastre-se com o Google</>}
                        </button>
                    )}
                </form>
            ) : (
                <form onSubmit={handlePasswordReset}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email para recuperação"
                        required
                    />
                    <button type="submit">
                        Enviar e-mail de recuperação
                    </button>
                    <button type="button" onClick={() => setIsResetPassword(false)}>Voltar</button>
                </form>
            )}

            {lockoutMessage && <p className="error-message">{lockoutMessage}</p>} {/* Exibe a mensagem de bloqueio */}

            {isLogin && !isResetPassword && (
                <p class="btn-redpass" >
                    Esqueceu sua senha?{' '}
                    <span onClick={() => setIsResetPassword(true)}>
                        Redefinir senha
                    </span>
                </p>
            )}

            {!isResetPassword && (
                <p class="btn-redpass">
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Registrar' : 'Login'}
                    </span>
                </p>
            )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            {resetMessage && <p className="success-message">{resetMessage}</p>}
            {registrationMessage && <p className="success-message">{registrationMessage}</p>}
        </div>
    );
};

export default AuthExample;
