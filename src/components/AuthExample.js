import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { FacebookAuthProvider, GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-dark/dark.css';
import logo from './img/name.png';
import googleIcon from './img/icon-google.png';
import './AuthExample.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { faPaperPlane, faArrowLeft, faSignInAlt, faUserPlus, faSpinner, faUser, faEnvelope, faLock, faEye, faEyeSlash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IntroPage from './IntroPage';
import githubIcon from './img/icons8-github-48.png';
import facebookIcon from './img/icons8-github-48.png';

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
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [showIntro, setShowIntro] = useState(true);
    const [isValidName, setIsValidName] = useState(true);

    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    useEffect(() => {
        const lastIntroShownTime = localStorage.getItem('lastIntroShownTime');
        const currentTime = Date.now();
        if (lastIntroShownTime && currentTime - lastIntroShownTime < THREE_HOURS_MS) {
            setShowIntro(false);
        }
    }, []);

    const handleContinue = () => {
        setShowIntro(false);
        localStorage.setItem('lastIntroShownTime', Date.now());
    };

    const validateName = (name) => {
        const regex = /^[a-zA-Z]+(?:\s[a-zA-Z]+)+$/;
        return regex.test(name);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value;
        setConfirmPassword(value);
        setPasswordsMatch(password === value);
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
            setLockoutMessage('Sua conta está bloqueada. Redefina sua senha e aguarde 3 minutos para acessar novamente.');
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
            const result = await signInWithPopup(auth, provider);
            let timerInterval;

            Swal.fire({
                icon: 'success',
                title: 'Login com Google bem-sucedido',
                html: 'Você foi logado com sucesso usando sua conta Google. Irei fechar em <b></b> milissegundos.',
                timer: 1600,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    const timer = Swal.getPopup().querySelector('b');
                    timerInterval = setInterval(() => {
                        timer.textContent = Swal.getTimerLeft();
                    }, 100);
                },
                willClose: () => {
                    clearInterval(timerInterval);
                }
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
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro no login com Google',
                    text: 'Erro ao fazer login com Google. Tente novamente.',
                    confirmButtonText: 'Ok',
                });
                console.error('Erro ao fazer login com Google:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setRegistrationMessage('');

        if (!validateName(firstName)) {
            setIsValidName(false);
            return;
        }
        setIsValidName(true);
        console.log("Nome e sobrenome válidos");

        if (!email.includes('@') || !email.includes('.')) {
            setErrorMessage('Por favor, insira um e-mail válido.');
            return;
        }

        if (checkPasswordStrength(password) === 'Fraca') {
            Swal.fire({
                icon: 'error',
                title: 'Senha Fraca',
                text: 'A senha inserida é muito fraca. Por favor, escolha uma senha com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.',
                confirmButtonText: 'Ok',
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
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            await user.updateProfile({
                displayName: firstName,
            });

            await user.sendEmailVerification();
            Swal.fire({
                icon: 'success',
                title: 'Cadastro realizado!',
                text: 'Verifique seu e-mail para confirmar sua conta antes de fazer login.',
                confirmButtonText: 'Ok',
            });

            setTimeout(() => {
                setIsLogin(true);
            }, 1200);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setErrorMessage('Esse e-mail já está em uso. Tente outro.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('E-mail inválido.');
            } else if (error.code === 'auth/weak-password') {
                setErrorMessage('Senha fraca. Escolha uma senha mais forte.');
            } else {
                setErrorMessage('Erro ao registrar. Verifique as informações e tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (isLockedOut || passwordResetRequested) {
            Swal.fire({
                icon: 'warning',
                title: 'Conta bloqueada',
                text: 'Você deve redefinir sua senha antes de tentar fazer login.',
                confirmButtonText: 'Ok',
            });
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (user.emailVerified) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login bem-sucedido',
                    html: 'Você foi logado com sucesso. Irei fechar em <b></b> milissegundos.',
                    timer: 900,
                    timerProgressBar: true,
                    didOpen: () => {
                        Swal.showLoading();
                        const timer = Swal.getPopup().querySelector('b');
                        setInterval(() => {
                            timer.textContent = Swal.getTimerLeft();
                        }, 100);
                    }
                }).then(() => {
                    navigate('/');
                });
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'E-mail não verificado',
                    text: 'Por favor, verifique seu e-mail antes de fazer login.',
                    confirmButtonText: 'Ok',
                });
                auth.signOut();
            }
        } catch (error) {
            const maxAttempts = 5;
            const attemptsLeft = maxAttempts - (loginAttempts + 1);
            setLoginAttempts(prev => prev + 1);
            localStorage.setItem('loginAttempts', loginAttempts + 1);

            if (loginAttempts + 1 >= maxAttempts) {
                setIsLockedOut(true);
                localStorage.setItem('isLockedOut', 'true');
                const lockoutTimeMinutes = 3;
                Swal.fire({
                    icon: 'error',
                    title: 'Conta bloqueada',
                    text: `Você excedeu o número de tentativas de login. Sua conta está bloqueada por ${lockoutTimeMinutes} minutos.`,
                    confirmButtonText: 'Ok',
                });
            } else {
                if (error.code === 'auth/user-not-found') {
                    Swal.fire({
                        icon: 'error',
                        title: 'E-mail não cadastrado',
                        text: 'Esse e-mail não está registrado. Por favor, verifique ou crie uma nova conta.',
                        confirmButtonText: 'Ok',
                    });
                } else if (error.code === 'auth/wrong-password') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Senha incorreta',
                        text: `Senha incorreta. Você tem ${attemptsLeft} tentativas restantes. Considere redefinir sua senha.`,
                        confirmButtonText: 'Ok',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro ao fazer login',
                        text: 'Não foi possível fazer login. Verifique as informações e tente novamente.',
                        confirmButtonText: 'Ok',
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            setErrorMessage('Por favor, insira seu e-mail para redefinir a senha.');
            return;
        }

        try {
            await auth.sendPasswordResetEmail(email);
            Swal.fire({
                icon: 'success',
                title: 'E-mail Enviado!',
                text: 'E-mail de recuperação de senha enviado. Verifique sua caixa de entrada ou lixo eletrônico.',
                confirmButtonText: 'Ok',
                customClass: {
                    confirmButton: 'btn btn-outline-warning'
                }
            });
            setErrorMessage('');
            setPasswordResetRequested(true);
            setIsLockedOut(false);

            localStorage.removeItem('isLockedOut');
            localStorage.removeItem('loginAttempts');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setErrorMessage('E-mail não encontrado. Verifique se o e-mail está correto.');
            } else if (error.code === 'auth/invalid-email') {
                setErrorMessage('E-mail inválido. Verifique o formato.');
            } else {
                setErrorMessage('Erro ao enviar o e-mail de recuperação. Tente novamente mais tarde.');
            }
        }
    };

    const handleGithubLogin = async () => {
        const provider = new GithubAuthProvider();
        setIsLoading(true);

        try {
            const result = await signInWithPopup(auth, provider);
            Swal.fire({
                icon: 'success',
                title: 'Login com GitHub bem-sucedido',
                text: 'Você foi logado com sucesso usando sua conta GitHub.',
                timer: 1600,
                timerProgressBar: true,
            }).then(() => {
                navigate('/');
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro no login com GitHub',
                text: 'Erro ao fazer login com GitHub. Tente novamente.',
                confirmButtonText: 'Ok',
            });
            console.error('Erro ao fazer login com GitHub:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        const provider = new FacebookAuthProvider();
        setIsLoading(true);

        try {
            const result = await signInWithPopup(auth, provider);
            Swal.fire({
                icon: 'success',
                title: 'Login com Facebook bem-sucedido',
                text: 'Você foi logado com sucesso usando sua conta do Facebook.',
                timer: 1600,
                timerProgressBar: true,
            }).then(() => {
                navigate('/');
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro no login com Facebook',
                text: 'Erro ao fazer login com Facebook. Tente novamente.',
                confirmButtonText: 'Ok',
            });
            console.error('Erro ao fazer login com Facebook:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <Helmet>
                <title>{isLogin ? 'Bubble Safe Chat - Login' : 'Bubble Safe Chat - Registro'}</title>
                <meta name="description" content="Bubble Safe Chat oferece salas de chat seguras e privadas com criptografia de ponta a ponta. Garanta a confidencialidade de suas conversas, com segurança de nível empresarial e recursos avançados de proteção de dados, respeitando regulamentações de privacidade como o GDPR e a LGPD. Converse sem preocupações e com total controle sobre sua privacidade." />
                <meta name="keywords" content="chat seguro, privacidade online, criptografia avançada, salas de chat privadas, segurança de dados, comunicação segura, proteção de dados pessoais, GDPR, LGPD, criptografia ponta a ponta, privacidade nas mensagens, comunicação confidencial, segurança digital, plataforma de chat segura, mensagem autodestrutiva" />
                <meta name="author" content="Bubble Safe Chat" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta property="og:site_name" content="Bubble Safe Chat" />
                <meta property="og:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta property="og:description" content="Salas de chat seguras e privadas com criptografia avançada. Proteja suas conversas com total privacidade e segurança online, em conformidade com regulamentações como o GDPR e a LGPD." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.bubblesafechat.com.br" />
                <meta property="og:image" content="https://www.bubblesafechat.com.br/icon-page-200.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com criptografia avançada. Segurança e privacidade são prioridades." />
                <meta name="twitter:image" content="https://www.bubblesafechat.com.br/icon-page-200.jpg" />
                <link rel="canonical" href="https://www.bubblesafechat.com.br" />
                <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
                <meta name="robots" content="index, follow" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="200" />
                <meta property="og:image:height" content="200" />
                <meta name="twitter:image:alt" content="Bubble Safe Chat - Segurança Total" />
                User-agent: *
                Allow: /
            </Helmet>

            {showIntro ? (
                <IntroPage onContinue={handleContinue} />
            ) : (
                <>
                    <img onClick={() => setShowIntro(true)} style={{ cursor: 'pointer', width: "300px" }} src={logo} alt="OpenSecurityRoom" />
                    <h1>{isResetPassword ? 'Redefinir Senha' : (isLogin ? 'Login' : 'Registrar')}</h1>

                    {lockoutMessage && <p className="error-message">{lockoutMessage}</p>}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {resetMessage && <p className="success-message">{resetMessage}</p>}
                    {registrationMessage && <p className="success-message">{registrationMessage}</p>}

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
                                        placeholder="Nome Sobrenome"
                                        className={`mt-2 ${!isValidName ? 'is-invalid' : ''}`}
                                        required
                                    />
                                    {!isValidName && (
                                        <div className="invalid-feedback">
                                            Por favor, insira um nome e sobrenome válidos.
                                        </div>
                                    )}
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
                                    className='mt-2'
                                />
                            </div>

                            <div className={`input-icon-container ${password ? checkPasswordStrength(password).toLowerCase() : ''}`}>
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
                                    className='mt-2'
                                />
                                <span onClick={togglePasswordVisibility} className="eye-icon">
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>

                            {!isLogin && (
                                <div className={`input-icon-container ${confirmPassword ? checkPasswordStrength(confirmPassword).toLowerCase() : ''}`}>
                                    <div className="icon-background">
                                        <FontAwesomeIcon icon={faLock} className="input-icon" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        placeholder="Confirmar Senha"
                                        required
                                        autoComplete="new-password"
                                        className='mt-2'
                                    />
                                    <span onClick={togglePasswordVisibility} className="eye-icon">
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                    </span>
                                </div>
                            )}

                            {!passwordsMatch && !isLogin && (
                                <p className="error-message">As senhas não correspondem. Por favor, tente novamente.</p>
                            )}

                            {/*{!isLogin && password && (
                                <p className={`password-strength ${checkPasswordStrength(password)}`}>
                                    <FontAwesomeIcon icon={faLock} className="me-2" />
                                    Senha {checkPasswordStrength(password)}
                                </p>
                            )}*/}

                            <button type="submit" style={{ height: '50px', fontWeight: '500', fontSize: '16px' }} className="btn btn-primary" disabled={isLoading || isLockedOut}>
                                {isLoading ? (
                                    <div className="spinner-container">
                                        <FontAwesomeIcon icon={faSpinner} spin className="spinner" />
                                    </div>
                                ) : (
                                    <>
                                        {isLogin ? (
                                            <>
                                                Access Room
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
                                <>
                                    <div className="d-flex justify-content-center gap-2 mt-2 div-btn-log">
                                        <button
                                            type="button"
                                            className="btn"
                                            style={{ height: '50px' }}
                                            onClick={handleGoogleLogin}
                                            disabled={isLoading || isLockedOut}
                                        >
                                            {isLoading ? 'Carregando...' : (
                                                <>
                                                    <img src={googleIcon} alt="Google" style={{ width: '24px', marginRight: '5px' }} />
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            className="btn"
                                            style={{ height: '50px' }}
                                            onClick={handleGithubLogin}
                                            disabled={isLoading || isLockedOut}
                                        >
                                            {isLoading ? 'Carregando...' : (
                                                <>
                                                    <img src={githubIcon} alt="GitHub" style={{ width: '30px', marginRight: '5px' }} />
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* <button
                                        type="button"
                                        className="btn btn-primary"
                                        style={{ height: '50px', marginTop: '10px' }}
                                        onClick={handleFacebookLogin}
                                        disabled={isLoading || isLockedOut}
                                    >
                                        {isLoading ? ' Carregando...' : (
                                            <>
                                                <img src={facebookIcon} alt="Facebook" style={{ width: '20px', marginRight: '5px' }} />
                                                Cadastre-se com o Facebook
                                            </>
                                        )}
                                    </button>*/}
                                </>
                            )}
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordReset}>

                            <div className="input-icon-container">
                                <div className="icon-background">
                                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email para recuperação"
                                    style={{ height: '50px' }}
                                    className='mt-2'
                                    required
                                />
                            </div>
                            <button type="submit" className='btn btn-primary' style={{ height: '50px' }}>
                                <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                Enviar e-mail de recuperação
                            </button>
                            <button type="button" style={{ height: '50px' }} className='btn btn-primary' onClick={() => setIsResetPassword(false)}>
                                <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
                                Voltar
                            </button>
                        </form>
                    )}

                    {isLogin && !isResetPassword && (
                        <p className="btn-redpass">
                            Esqueceu sua senha?{' '}
                            <span onClick={() => setIsResetPassword(true)}>
                                Redefinir senha
                            </span>
                        </p>
                    )}

                    {!isResetPassword && (
                        <p className="btn-redpass">
                            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                            <span onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Registrar' : 'Login'}
                            </span>
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default AuthExample;
