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
        <motion.div className="intro-container">
            <Helmet>
                <title>Bubble Safe Chat - Segurança Total para Suas Conversas</title>
                <meta name="description" content="Salas de chat seguras e privadas com criptografia avançada. Proteja suas conversas com total privacidade e segurança online." />
                <meta name="keywords" content="chat seguro, privacidade, criptografia, salas de chat, segurança online, comunidade, criptografia avançada, conversas privadas" />
                <meta name="author" content="Bubble Safe Chat" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
                <meta property="og:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta property="og:description" content="Participe do Bubble Safe Chat para criar ou acessar salas de chat criptografadas. Segurança e privacidade são prioridades." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.bubblesafechat.com.br" />
                <meta property="og:image" content="https://www.bubblesafechat.com.br/icon-page-200" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Bubble Safe Chat - Segurança Total para Suas Conversas" />
                <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com criptografia avançada." />
                <meta name="twitter:image" content="https://www.bubblesafechat.com.br/icon-page-200" />
                <link rel="canonical" href="https://www.bubblesafechat.com.br" />
                <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
                <meta name="robots" content="index, follow" />
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
                            <b
                                className="btn btn-outline-info btn-acess-enter me-1"
                                onClick={handleLearnMore}
                            >
                                <FontAwesomeIcon icon={faQuestion} />
                            </b>
                            <b
                                className="btn btn-outline-info btn-acess-enter"
                                onClick={onContinue}
                            >
                                <FontAwesomeIcon icon={faUser} />
                            </b>
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
                    Experimente o futuro da comunicação segura com o Bubble Safe Chat. Sua privacidade não é apenas garantida, é nossa prioridade número um. Com tecnologia de ponta, garantimos que todas as suas conversas sejam protegidas por criptografia avançada, permitindo que você controle completamente quem tem acesso às suas informações. Entre em um ambiente digital seguro e aproveite a tranquilidade ao conversar online.
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
