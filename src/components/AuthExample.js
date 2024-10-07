import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';  // Usar useNavigate para redirecionar

const AuthExample = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);  // Alternar entre Login e Registro
    const [errorMessage, setErrorMessage] = useState('');  // Para exibir mensagens de erro
    const navigate = useNavigate();  // Para redirecionar o usuário após login ou registro

    // Função para registrar o usuário
    const handleRegister = () => {
        setErrorMessage('');  // Limpar mensagens de erro
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log('Usuário registrado:', userCredential.user);
                navigate('/');  // Redireciona para a criação de sala após o registro
            })
            .catch(error => {
                // Captura erros de e-mail já em uso
                if (error.code === 'auth/email-already-in-use') {
                    setErrorMessage('Esse e-mail já está em uso. Tente outro.');
                } else if (error.code === 'auth/invalid-email') {
                    setErrorMessage('E-mail inválido.');
                } else {
                    setErrorMessage('Erro ao registrar. Verifique as informações e tente novamente.');
                }
            });
    };

    // Função para fazer login do usuário
    const handleLogin = () => {
        setErrorMessage('');
        auth.signInWithEmailAndPassword(email, password)
          .then(userCredential => {
            console.log('Usuário logado:', userCredential.user);
            navigate('/');  // Redireciona para a rota inicial após o login
          })
          .catch(error => {
            if (error.code === 'auth/wrong-password') {
              setErrorMessage('Senha incorreta. Tente novamente.');
            } else if (error.code === 'auth/user-not-found') {
              setErrorMessage('E-mail não encontrado. Verifique se o e-mail está correto.');
            } else {
              setErrorMessage('Erro ao fazer login. Verifique as credenciais e tente novamente.');
            }
          });
      };      

    return (
        <div>
            <h1>{isLogin ? 'Login' : 'Registrar'}</h1>

            {/* Campo de e-mail */}
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />

            {/* Campo de senha */}
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
            />

            {/* Botão de Login ou Registro */}
            {isLogin ? (
                <button onClick={handleLogin}>Login</button>
            ) : (
                <button onClick={handleRegister}>Registrar</button>
            )}

            {/* Alternar entre Login e Registro */}
            <p>
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                <span onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Registrar' : 'Login'}
                </span>
            </p>

            {/* Exibir mensagens de erro */}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
};

export default AuthExample;
