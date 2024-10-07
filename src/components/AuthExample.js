import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const AuthExample = () => {
    const [firstName, setFirstName] = useState('');  // Estado para o primeiro nome
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');  
    const [isLogin, setIsLogin] = useState(true);  
    const [showPassword, setShowPassword] = useState(false);  
    const [errorMessage, setErrorMessage] = useState('');  
    const [resetMessage, setResetMessage] = useState('');  
    const [isResetPassword, setIsResetPassword] = useState(false); 
    const [registrationMessage, setRegistrationMessage] = useState('');  // Novo estado para a mensagem de registro
    const navigate = useNavigate();

    // Função para registrar o usuário
    const handleRegister = (e) => {
        e.preventDefault();
        setErrorMessage('');
        setRegistrationMessage('');  // Limpa a mensagem de registro anterior

        // Validação de e-mail, senha, confirmação de senha e nome antes de enviar para o Firebase
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

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;

                // Enviar e-mail de verificação
                user.sendEmailVerification()
                    .then(() => {
                        setRegistrationMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar sua conta antes de fazer login.');
                        setTimeout(() => {
                            setIsLogin(true);  // Alterna para a página de login após 5 segundos
                            setRegistrationMessage('');  // Limpa a mensagem de registro após exibir
                        }, 5000);  // Após 5 segundos, redireciona para login
                    })
                    .catch(error => {
                        setErrorMessage('Erro ao enviar e-mail de verificação.');
                    });

                // Desloga automaticamente após o registro até a verificação do e-mail
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
            });
    };

    // Função para fazer login do usuário
    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMessage('');

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
                if (error.code === 'auth/wrong-password') {
                    setErrorMessage('Senha incorreta. Tente novamente.');
                } else if (error.code === 'auth/user-not-found') {
                    setErrorMessage('E-mail não encontrado. Verifique se o e-mail está correto.');
                } else if (error.code === 'auth/invalid-email') {
                    setErrorMessage('E-mail inválido. Verifique o formato.');
                } else {
                    setErrorMessage('Erro ao fazer login. Verifique as credenciais e tente novamente.');
                }
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
                        onChange={(e) => setPassword(e.target.value)}
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

                    <button type="submit">
                        {isLogin ? 'Login' : 'Registrar'}
                    </button>
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
