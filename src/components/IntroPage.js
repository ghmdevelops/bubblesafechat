import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IntroPage.css';
import { motion } from 'framer-motion';
import iconPage from './img/icon-page.png';
import iconPageVisual from './img/StockCake-Cybersecurity.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import iconNavLarge from './img/icon-menu.png';

const IntroPage = ({ onContinue }) => {
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const [pageBlocked, setPageBlocked] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const consentGiven = localStorage.getItem('cookieConsent');
        const consentTimestamp = localStorage.getItem('cookieConsentTimestamp');

        // Verifica se o consentimento foi dado e se é válido
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

    return (
        <div className="intro-container">
            <Helmet>
                <title>Bubble Safe Chat - Segurança Total para Suas Conversas</title>
                <meta name="description" content="Entre no Bubble Safe Chat para criar ou acessar salas de chat seguras e privadas. Junte-se à comunidade e proteja suas conversas online com criptografia de ponta a ponta." />
                <meta name="keywords" content="chat seguro, privacidade, criptografia, salas de chat, segurança online, comunidade, criptografia avançada, conversas privadas" />
                <meta name="author" content="Bubble Safe Chat" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta property="og:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta property="og:description" content="Participe do Bubble Safe Chat para criar ou acessar salas de chat criptografadas. Segurança e privacidade são prioridades." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.bubblesafechat.com" />
                <meta property="og:image" content="https://www.bubblesafechat.com/path_to_your_image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com criptografia avançada." />
                <meta name="twitter:image" content="https://www.bubblesafechat.com/path_to_your_image.jpg" />
                <link rel="canonical" href="https://www.bubblesafechat.com" />
                <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
                <meta name="robots" content="index, follow" />
                User-agent: *
                Allow: /
            </Helmet>

            {pageBlocked && <div className="page-blocker"></div>} {/* Mantém o bloqueio da página até aceitar os cookies */}

            <motion.div
                className="intro-content"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
                <div className="header-section">
                    <img src={iconNavLarge} alt="Logo" className="logo-image" />
                </div>
            </motion.div>

            <motion.div
                className="intro-content mt-2 mb-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
                <motion.div
                    className="content-left"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                >
                    <h2 className='mt-2'>
                        Experimente o futuro da comunicação segura com o Bubble Safe Chat. Sua privacidade não é apenas
                        garantida, é nossa prioridade número um. Com tecnologia de ponta, garantimos que todas as suas
                        conversas sejam protegidas por criptografia avançada, permitindo que você controle completamente
                        quem tem acesso às suas informações. Entre em um ambiente digital seguro e aproveite a
                        tranquilidade ao conversar online.
                    </h2>
                    <motion.div className="login-section">
                        <motion.button
                            className="btn btn-outline-info btn-acess-learn"
                            onClick={handleLearnMore}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            Saiba Mais
                        </motion.button>
                        <motion.button
                            className="btn btn-outline-success btn-acess-enter"
                            onClick={onContinue}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FontAwesomeIcon icon={faUserCircle} className="me-1" />
                            Entrar
                        </motion.button>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="content-right"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.2 }}
                >
                    <img src={iconPageVisual} alt="OpenSecurityRoom" className="visual-image" />
                </motion.div>
            </motion.div>

            {showCookieConsent && (
                <motion.div
                    className="cookie-consent shadow-lg p-3 mb-5 bg-black rounded"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                    <img src={iconPage} alt="Logo" className="cookie-logo" />
                    <p className="mt-3">
                        Este site utiliza cookies para otimizar sua experiência. Ao aceitar, você concorda com a nossa{' '}
                        <a href="/cookie-policy" target="_blank">
                            Política de Cookies
                        </a>.
                    </p>
                    <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                        <li>Garantir que sua sessão seja mantida de forma segura.</li>
                        <li>Analisar o tráfego para entender como você utiliza nosso site.</li>
                        <li>Personalizar conteúdo e melhorar a experiência do usuário.</li>
                    </ul>
                    <div className="cookie-buttons mt-4 d-flex justify-content-between btn-cooki">
                        <button onClick={handleCookieConsent} className="btn btn-primary ac">
                            Aceitar Cookies
                        </button>
                        <button onClick={handleCookieDecline} className="btn btn-danger rc">
                            Recusar Cookies
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default IntroPage;
