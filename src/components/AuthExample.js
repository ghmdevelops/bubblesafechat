import React, { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import ReCAPTCHA from 'react-google-recaptcha';

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
    const [lockoutTime, setLockoutTime] = useState(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [captchaValue, setCaptchaValue] = useState(null); // Estado para o valor do reCAPTCHA
    const [isCaptchaValidated, setIsCaptchaValidated] = useState(false); // Estado para controle do CAPTCHA
    const navigate = useNavigate();

    useEffect(() => {
        // Verifica se o usuário está bloqueado
        const storedLockoutTime = localStorage.getItem('lockoutTime');
        const storedAttempts = localStorage.getItem('loginAttempts');

        if (storedLockoutTime) {
            const remainingTime = Math.ceil((parseInt(storedLockoutTime) - Date.now()) / 1000);
            if (remainingTime > 0) {
                setIsLockedOut(true);
                setLockoutTime(parseInt(storedLockoutTime));
                setRemainingTime(remainingTime);
            }
        }

        if (storedAttempts) {
            setLoginAttempts(parseInt(storedAttempts));
        }

        if (isLockedOut && lockoutTime) {
            const timer = setInterval(() => {
                const newRemainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
                if (newRemainingTime <= 0) {
                    setIsLockedOut(false);
                    setLoginAttempts(0);
                    localStorage.removeItem('lockoutTime');
                    localStorage.removeItem('loginAttempts');
                    setErrorMessage('Você pode tentar fazer login novamente.');
                    clearInterval(timer);
                } else {
                    setRemainingTime(newRemainingTime);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isLockedOut, lockoutTime]);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        setIsLoading(true);

        try {
            await signInWithPopup(auth, provider);
            navigate('/');
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

        if (!isCaptchaValidated) {
            setErrorMessage('Por favor, complete o CAPTCHA.');
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

        if (isLockedOut) {
            setErrorMessage(`Você foi bloqueado após muitas tentativas. Por favor, redefina sua senha.`);
            return;
        }

        if (!isCaptchaValidated) {
            setErrorMessage('Por favor, complete o CAPTCHA.');
            return;
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
                const attemptsLeft = 4 - loginAttempts;
                setLoginAttempts(prev => prev + 1);
                localStorage.setItem('loginAttempts', loginAttempts + 1);

                if (loginAttempts + 1 >= 5) {
                    setIsLockedOut(true);
                    const lockoutEndTime = Date.now() + 5 * 60 * 1000; // Bloqueio por 5 minutos
                    setLockoutTime(lockoutEndTime);
                    localStorage.setItem('lockoutTime', lockoutEndTime);
                    setErrorMessage('Você excedeu o número de tentativas de login. Por favor, redefina sua senha.');
                } else {
                    if (error.code === 'auth/wrong-password') {
                        setErrorMessage(`Senha incorreta. Você tem ${attemptsLeft} tentativas restantes.`);
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

                // Redireciona para a tela de login após 5 segundos
                setTimeout(() => {
                    setIsResetPassword(false);
                    setEmail('');
                    setErrorMessage('Você foi bloqueado após muitas tentativas. O bloqueio continuará por 5 minutos. Tente novamente após esse período.');
                }, 5000);
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

    const onCaptchaChange = (value) => {
        if (value) {
            setCaptchaValue(value); // Armazena o valor do reCAPTCHA
            setIsCaptchaValidated(true); // Habilita o botão
        }
    };

    return (
        <div>
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

                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        Mostrar senha
                    </label>

                    <ReCAPTCHA
                        sitekey="6Ld-GFsqAAAAAJJ2LrG7mdJTyxhGxz3oDG5mTa14" // Substitua pela sua chave do site
                        onChange={onCaptchaChange} // Função chamada ao completar o CAPTCHA
                    />

                    <button type="submit" disabled={isLoading || isLockedOut || !isCaptchaValidated}>
                        {isLoading ? 'Carregando...' : (isLogin ? 'Login' : 'Registrar')}
                    </button>

                    {isLogin && (
                        <button type="button" onClick={handleGoogleLogin} disabled={isLoading || isLockedOut}>
                            {isLoading ? 'Carregando...' : 'Login com Google'}
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
                    <button type="submit">Enviar e-mail de recuperação</button>
                </form>
            )}

            {isLogin && !isResetPassword && (
                <p>
                    Esqueceu sua senha?{' '}
                    <span onClick={() => setIsResetPassword(true)} style={{ color: 'blue', cursor: 'pointer' }}>
                        Redefinir senha
                    </span>
                </p>
            )}

            {!isResetPassword && (
                <p>
                    {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                    <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'blue', cursor: 'pointer' }}>
                        {isLogin ? 'Registrar' : 'Login'}
                    </span>
                </p>
            )}

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {resetMessage && <p style={{ color: 'green' }}>{resetMessage}</p>}
            {registrationMessage && <p style={{ color: 'green' }}>{registrationMessage}</p>}
        </div>
    );
};

export default AuthExample;
