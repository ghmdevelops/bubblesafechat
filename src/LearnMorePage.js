import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LearnMorePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faLock, faShieldAlt, faCommentDots, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import iconPage from './components/img/icon-menu.png';
import iconPageVisual from './components/img/iIJrUoeRoCQ-resized.jpg';

const LearnMorePage = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate('/login');
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="learn-more-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{ width: '100%', padding: '0' }}
        >
            <Helmet>
                <title>Bubble Safe Chat - Saiba Mais</title>
                <meta name="title" content="Bubble Safe Chat" />
                <meta name="description" content="Bubble Safe Chat oferece salas de chat seguras e privadas com criptografia de ponta a ponta. Garanta a confidencialidade de suas conversas, com segurança de nível empresarial e recursos avançados de proteção de dados, respeitando regulamentações de privacidade como o GDPR e a LGPD. Converse sem preocupações e com total controle sobre sua privacidade." />
                <meta name="keywords" content="chat seguro, privacidade online, criptografia avançada, salas de chat privadas, segurança de dados, comunicação segura, proteção de dados pessoais, GDPR, LGPD, criptografia ponta a ponta, privacidade nas mensagens, comunicação confidencial, segurança digital, plataforma de chat segura, mensagem autodestrutiva" />
                <meta name="author" content="Bubble Safe Chat" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta property="og:site_name" content="Bubble Safe Chat" />
                <meta property="og:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta property="og:description" content="Salas de chat seguras e privadas com criptografia avançada. Proteja suas conversas com total privacidade e segurança online, em conformidade com regulamentações como o GDPR e a LGPD." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://bubblesafechat.com.br" />
                <meta property="og:image" content="https://bubblesafechat.com.br/icon-page-200.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com criptografia avançada. Segurança e privacidade são prioridades." />
                <meta name="twitter:image" content="https://bubblesafechat.com.br/icon-page-200.jpg" />
                <link rel="canonical" href="https://bubblesafechat.com.br" />
                <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
                <meta name="robots" content="index, follow" />
                <meta property="og:image:type" content="image/jpeg" />
                <meta property="og:image:width" content="200" />
                <meta property="og:image:height" content="200" />
                <meta name="twitter:image:alt" content="Bubble Safe Chat - Segurança Total" />
                User-agent: *
                Allow: /
            </Helmet>

            <header>
                <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
                    <div className="container-fluid">
                        <img className="navbar-brand img-fluid responsive-img" src={iconPage} alt="Bubble Safe Chat" />
                        <div className="collapse navbar-collapse" id="navbarCollapse"></div>
                        <motion.button
                            className="btn-back-login"
                            onClick={goToLogin}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{
                                scale: 1.1,
                                background: "linear-gradient(90deg, #007bff, #00d4ff)",
                                color: "white",
                                boxShadow: "0 8px 15px rgba(0, 0, 0, 0.4)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: window.innerWidth <= 576 ? "10px" : "10px 16px",
                                fontSize: window.innerWidth <= 576 ? "1rem" : "1rem",
                                color: window.innerWidth <= 576 ? "white" : "#fff",
                                background: "transparent",
                                border: "2px solid rgba(0, 187, 255, 0.74)",
                                borderRadius: "50px",
                                cursor: "pointer",
                                outline: "none",
                                margin: "0 10px",
                                width: window.innerWidth <= 576 ? "30px" : "auto",
                                height: window.innerWidth <= 576 ? "30px" : "auto",
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            {window.innerWidth > 576 && <span style={{ marginLeft: "8px" }}>Voltar</span>}
                        </motion.button>
                    </div>
                </nav>
            </header>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="content-right"
            >
                <img src={iconPageVisual} alt="Bubble Safe Chat" className="visual-image" />
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: "easeInOut", delay: 0.3 }}
                className="page-description mt-3 mb-3"
                style={{
                    fontSize: "1.2rem",
                    lineHeight: "1.6",
                    color: "#f1f1f1",
                    textAlign: "center",
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "0 20px",
                }}
            >
                <strong>Bubble Safe Chat</strong> é a sua solução definitiva para comunicação online segura e privada.
                Nossa plataforma foi projetada para proteger seus dados em cada etapa, oferecendo segurança de nível mundial e funcionalidades avançadas para manter suas conversas e informações pessoais sob total controle.
            </motion.p>

            <motion.h2
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="section-title-dados"
            >
                O que o Bubble Safe Chat oferece?
            </motion.h2>

            <div className="features-container">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faLock} className="feature-icon" />
                    <h3>Criptografia Avançada</h3>
                    <p>Todas as conversas são protegidas por criptografia de ponta a ponta, garantindo que somente você e o destinatário possam acessar o conteúdo.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faShieldAlt} className="feature-icon" />
                    <h3>Mensagens Protegidas com Senha</h3>
                    <p>Adicione uma camada extra de segurança às suas mensagens, configurando senhas personalizadas.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faCommentDots} className="feature-icon" />
                    <h3>Controle Total</h3>
                    <p>Você tem controle completo sobre suas salas de chat, definindo quem pode entrar e quanto tempo as mensagens permanecerão.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faQrcode} className="feature-icon" />
                    <h3>Compartilhamento via QR Code</h3>
                    <p>Crie salas de chat rapidamente e compartilhe o acesso por meio de QR codes.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.1 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faUser} className="feature-icon" />
                    <h3>Anonimato Garantido</h3>
                    <p>Participe de conversas sem revelar sua identidade. Privacidade total nas suas interações.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faLock} className="feature-icon" />
                    <h3>Autodestruição de Mensagens</h3>
                    <p>Configura mensagens para autodestruição após visualização ou após um período definido.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.3 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faShieldAlt} className="feature-icon" />
                    <h3>Segurança em Camadas</h3>
                    <p>Utilizamos múltiplas camadas de segurança para proteger suas conversas e dados.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.4 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faCommentDots} className="feature-icon" />
                    <h3>Fale e Escreva</h3>
                    <p>Use o reconhecimento de voz para transcrever suas mensagens rapidamente.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.5 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faCommentDots} className="feature-icon" />
                    <h3>Interação em Tempo Real</h3>
                    <p>Converse instantaneamente com amigos e familiares, sem atrasos.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faCommentDots} className="feature-icon" />
                    <h3>Mensagens de Voz</h3>
                    <p>Envie mensagens de voz rápidas e fáceis, mantendo a comunicação fluida.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.7 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faLock} className="feature-icon" />
                    <h3>Verificação de Segurança</h3>
                    <p>Realize verificações de segurança regulares para manter sua conta segura.</p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="feature-card"
                >
                    <FontAwesomeIcon icon={faQrcode} className="feature-icon" />
                    <h3>Facilidade de Uso</h3>
                    <p>Interface intuitiva que facilita a navegação e o uso da plataforma.</p>
                </motion.div>
            </div>

            <motion.h2
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="section-title-dados"
            >
                Por que escolher o Bubble Safe Chat?
            </motion.h2>
            <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="page-description"
            >
                O <strong>Bubble Safe Chat</strong> é a melhor escolha para quem busca uma comunicação online privada, segura e eficiente. Nossa plataforma é fácil de usar, com funcionalidades avançadas para manter suas conversas protegidas.
                Além disso, oferecemos suporte contínuo e garantimos um tempo de atividade de 99,9%, assegurando que suas conversas nunca sejam interrompidas. Seja para uso pessoal ou profissional, o Bubble Safe Chat oferece as ferramentas que você precisa para manter suas informações seguras e privadas.
            </motion.p>
        </motion.div>
    );
};

export default LearnMorePage;
