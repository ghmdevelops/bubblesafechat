import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css';
import logo from './img/name.png';
import icon from './img/icon-page.png';
import googleIcon from './img/icon-google.png';
import './AuthExample.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { faSignInAlt, faUserPlus, faSpinner, faUser, faEnvelope, faLock, faEye, faEyeSlash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutMessage, setLockoutMessage] = useState('');
    const [passwordResetRequested, setPasswordResetRequested] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const checkPasswordStrength = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;

        if (!isLongEnough) {
            return 'Fraca';
        } else if (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
            return 'Forte';
        } else {
            return 'Média';
        }
    };

    useEffect(() => {
        setEmail('');
        setPassword('');

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

            Swal.fire({
                icon: 'success',
                title: 'Login com Google bem-sucedido',
                text: 'Você foi logado com sucesso usando sua conta Google.',
                confirmButtonText: 'Ok',
                customClass: {
                    confirmButton: 'btn btn-primary',
                },
                buttonsStyling: false,
            }).then(() => {
                navigate('/');
            });
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Autenticação interrompida',
                    text: 'A janela de autenticação foi fechada. Tente novamente.',
                    confirmButtonText: 'Ok',
                    customClass: {
                        confirmButton: 'btn btn-primary',
                    },
                    buttonsStyling: false,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro no login com Google',
                    text: 'Erro ao fazer login com Google. Tente novamente.',
                    confirmButtonText: 'Ok',
                    customClass: {
                        confirmButton: 'btn btn-primary',
                    },
                    buttonsStyling: false,
                });
                console.error('Erro ao fazer login com Google:', error);
            }
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

        if (checkPasswordStrength(password) === 'fraca') {
            Swal.fire({
                icon: 'error',
                title: 'Senha Fraca',
                text: 'A senha inserida é muito fraca. Por favor, escolha uma senha com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.',
                confirmButtonText: 'Ok',
                customClass: {
                    confirmButton: 'btn btn-primary',
                },
                buttonsStyling: false,
            });
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
                        Swal.fire({
                            icon: 'success',
                            title: 'Cadastro realizado!',
                            text: 'Verifique seu e-mail para confirmar sua conta antes de fazer login.',
                            confirmButtonText: 'Ok',
                            customClass: {
                                confirmButton: 'btn btn-primary',
                            },
                            buttonsStyling: false,
                        });

                        setTimeout(() => {
                            setIsLogin(true);
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

        if (isLockedOut || passwordResetRequested) {
            Swal.fire({
                icon: 'warning',
                title: 'Conta bloqueada',
                text: 'Você deve redefinir sua senha antes de tentar fazer login.',
                confirmButtonText: 'Ok',
                customClass: {
                    confirmButton: 'btn btn-primary',
                },
                buttonsStyling: false,
            });
            return;
        }

        setIsLoading(true);
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;

                if (user.emailVerified) {
                    // Login bem-sucedido
                    Swal.fire({
                        icon: 'success',
                        title: 'Login bem-sucedido',
                        text: 'Você foi logado com sucesso.',
                        confirmButtonText: 'Ok',
                        customClass: {
                            confirmButton: 'btn btn-primary',
                        },
                        buttonsStyling: false,
                    }).then(() => {
                        navigate('/');
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'E-mail não verificado',
                        text: 'Por favor, verifique seu e-mail antes de fazer login.',
                        confirmButtonText: 'Ok',
                        customClass: {
                            confirmButton: 'btn btn-primary',
                        },
                        buttonsStyling: false,
                    });
                    auth.signOut();
                }
            })
            .catch(error => {
                const attemptsLeft = 4 - loginAttempts;
                setLoginAttempts(prev => prev + 1);
                localStorage.setItem('loginAttempts', loginAttempts + 1);

                if (loginAttempts + 1 >= 5) {
                    setIsLockedOut(true);
                    localStorage.setItem('isLockedOut', 'true');
                    Swal.fire({
                        icon: 'error',
                        title: 'Conta bloqueada',
                        text: 'Você excedeu o número de tentativas de login. Redefina sua senha.',
                        confirmButtonText: 'Ok',
                        customClass: {
                            confirmButton: 'btn btn-primary',
                        },
                        buttonsStyling: false,
                    });
                } else {
                    if (error.code === 'auth/wrong-password') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Senha incorreta',
                            text: `Senha incorreta. Você tem ${attemptsLeft} tentativas restantes. Considere redefinir sua senha.`,
                            confirmButtonText: 'Ok',
                            customClass: {
                                confirmButton: 'btn btn-primary',
                            },
                            buttonsStyling: false,
                        });
                    } else if (error.code === 'auth/user-not-found') {
                        Swal.fire({
                            icon: 'error',
                            title: 'E-mail não encontrado',
                            text: 'E-mail não encontrado. Verifique se o e-mail está correto.',
                            confirmButtonText: 'Ok',
                            customClass: {
                                confirmButton: 'btn btn-primary',
                            },
                            buttonsStyling: false,
                        });
                    } else if (error.code === 'auth/invalid-email') {
                        Swal.fire({
                            icon: 'error',
                            title: 'E-mail inválido',
                            text: 'E-mail inválido. Verifique o formato.',
                            confirmButtonText: 'Ok',
                            customClass: {
                                confirmButton: 'btn btn-primary',
                            },
                            buttonsStyling: false,
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro ao fazer login',
                            text: 'Erro ao fazer login. Verifique as credenciais e tente novamente.',
                            confirmButtonText: 'Ok',
                            customClass: {
                                confirmButton: 'btn btn-primary',
                            },
                            buttonsStyling: false,
                        });
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
                setPasswordResetRequested(true);
                setIsLockedOut(false);

                localStorage.removeItem('isLockedOut');
                localStorage.removeItem('loginAttempts');
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
                        <div className="input-icon-container">
                            <div className="icon-background">
                                <FontAwesomeIcon icon={faUser} className="input-icon" />
                            </div>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Primeiro Nome"
                                required
                            />
                        </div>
                    )}

                    <div className="input-icon-container">
                        <div className="icon-background">
                            <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                        </div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="input-icon-container">
                        <div className="icon-background">
                            <FontAwesomeIcon icon={faLock} className="input-icon" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha"
                            required
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                        <span onClick={togglePasswordVisibility} className="eye-icon">
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </span>
                    </div>

                    {!isLogin && (
                        <div className="input-icon-container">
                            <div className="icon-background">
                                <FontAwesomeIcon icon={faLock} className="input-icon" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmar Senha"
                                required
                                autoComplete="new-password"
                            />
                            <span onClick={togglePasswordVisibility} className="eye-icon">
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </span>
                        </div>
                    )}

                    {password && (
                        <p className={`password-strength ${checkPasswordStrength(password)}`}>
                            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                            Senha {checkPasswordStrength(password)}
                        </p>
                    )}

                    <button type="submit" disabled={isLoading || isLockedOut}>
                        {isLoading ? (
                            <div className="spinner-container">
                                <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
                            </div>
                        ) : (
                            <>
                                {isLogin ? (
                                    <>
                                        <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                                        Login
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                                        Registrar
                                    </>
                                )}
                            </>
                        )}
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

            {lockoutMessage && <p className="error-message">{lockoutMessage}</p>}

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
