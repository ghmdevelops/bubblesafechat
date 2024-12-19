import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IntroPage.css';
import { motion } from 'framer-motion';
import iconPage from './img/icon-menu.png';
import iconPageVisual from './img/rm373batch4-15.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

const IntroPage = ({ onContinue }) => {
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const [pageBlocked, setPageBlocked] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const consentGiven = localStorage.getItem('cookieConsent');
        const consentTimestamp = localStorage.getItem('cookieConsentTimestamp');

        if (!consentGiven || (consentTimestamp && (Date.now() - Number(consentTimestamp)) > 7 * 24 * 60 * 60 * 1000)) {
            setShowCookieConsent(true);
            setPageBlocked(true);
        } else {
            setPageBlocked(false);
        }
        setTimeout(() => setIsLoading(false), 1500);
    }, []);

    useEffect(() => {
        const consentGiven = localStorage.getItem('cookieConsent');
        const consentTimestamp = localStorage.getItem('cookieConsentTimestamp');

        if (!consentGiven || (consentTimestamp && (Date.now() - Number(consentTimestamp)) > 7 * 24 * 60 * 60 * 1000)) {
            setShowCookieConsent(true);
            setPageBlocked(true);
        } else {
            setPageBlocked(false);
        }
    }, []);

    const handleCookieConsent = () => {
        setShowCookieConsent(false);
        setPageBlocked(false);
        localStorage.setItem('cookieConsent', 'true');
        localStorage.setItem('cookieConsentTimestamp', Date.now().toString());
    };

    const handleCookieDecline = () => {
        setShowCookieConsent(false);
        setPageBlocked(false);
        localStorage.setItem('cookieConsent', 'false');
    };

    const handleLearnMore = () => {
        navigate('/learn-more');
    };

    const handleCookiePolicy = () => {
        navigate('/cookie-policy');
    };

    return (
        <motion.div className="intro-container">
            <Helmet>
                <title>Bubble Safe Chat - Segurança Total para Suas Conversas</title>
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
                        <img
                            className="navbar-brand img-fluid responsive-img"
                            src={iconPage}
                            alt="OpenSecurityRoom"
                        />
                        <div className="icon-enter-user d-flex justify-content-center align-items-center">
                            <motion.button
                                className="btn-enter-app"
                                onClick={onContinue}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{
                                    scale: 1.15,
                                    background: "linear-gradient(90deg,rgb(42, 129, 164),rgb(12, 115, 200))",
                                    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.4)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: window.innerWidth <= 576 ? "9px" : "12px 10px",
                                    fontSize: window.innerWidth <= 576 ? "0.8rem" : "1rem",
                                    fontWeight: "bold",
                                    color: "white",
                                    background: "transparent",
                                    border: "2px solid rgb(0, 138, 230)",
                                    borderRadius: "50px",
                                    cursor: "pointer",
                                    outline: "none",
                                    margin: "0 10px",
                                    width: window.innerWidth <= 576 ? "30px" : "auto",
                                    height: window.innerWidth <= 576 ? "30px" : "auto",
                                }}
                            >
                                <FontAwesomeIcon icon={faUser} style={{ marginRight: window.innerWidth <= 576 ? "0" : "8px" }} />
                                {window.innerWidth > 576 && "Entrar"}
                            </motion.button>
                        </div>
                    </div>
                </nav>
            </header>

            <div className="image-text-container" style={{ position: 'relative', width: '100vw', height: '100vh' }}>
                <motion.div
                    className="learn-more-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: '100%', height: '100%', padding: '0' }}
                >
                    <img
                        src={iconPageVisual}
                        alt="OpenSecurityRoom"
                        className="visual-image-pageifo"
                    />
                </motion.div>
                <h2 className='mt-2 page-text-ifo'>
                    Comunicação Segura, Privacidade Garantida
                    Converse com tranquilidade em um ambiente protegido por tecnologia de criptografia avançada e múltiplas camadas de segurança. Controle quem acessa suas salas de chat, compartilhe links seguros via QR code e gerencie suas conversas de forma simples e eficiente. Sua privacidade é nossa prioridade número um.
                    <br />
                    <motion.button
                        className="btn-learn-more"
                        onClick={() => navigate('/learn-more')}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{
                            scale: 1.1,
                            background: "linear-gradient(90deg, #0056b3, #00aaff)",
                            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.5)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{
                            marginTop: "20px",
                            padding: "12px 26px",
                            fontSize: "1rem",
                            fontWeight: "bold",
                            color: "white",
                            background: "linear-gradient(90deg, #007bff, #00d4ff)",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            outline: "none",
                        }}
                    >
                        Saiba Mais
                    </motion.button>
                </h2>
            </div>

            {pageBlocked && <div className="page-blocker"></div>}

            {
                showCookieConsent && (
                    <motion.div
                        className="cookie-consent shadow-lg p-3 mb-5 bg-black rounded"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                    >
                        <img src={iconPage} alt="Logo" className="cookie-logo" />
                        <p className="mt-3">
                            Este site utiliza cookies para otimizar sua experiência. Ao aceitar, você concorda com a nossa{' '}
                            <span onClick={handleCookiePolicy} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                                Política de Cookies
                            </span>.
                        </p>
                        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                            <li>Garantir que sua sessão seja mantida de forma segura.</li>
                            <li>Analisar o tráfego para entender como você utiliza nosso site.</li>
                            <li>Personalizar conteúdo e melhorar a experiência do usuário.</li>
                        </ul>
                        <div className="cookie-buttons mt-4 d-flex justify-content-between btn-cooki">
                            <button
                                onClick={handleCookieConsent}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '5px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Aceitar Cookies
                            </button>
                            <button
                                onClick={handleCookieDecline}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '5px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Recusar Cookies
                            </button>
                        </div>
                    </motion.div>
                )
            }
        </motion.div>
    );
};

export default IntroPage;
