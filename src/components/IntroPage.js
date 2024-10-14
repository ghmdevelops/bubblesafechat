import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IntroPage.css';
import iconPage from './img/icon-page.png';
import { Helmet } from 'react-helmet';
import iconPageVisual from './img/StockCake-Cybersecurity.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube } from '@fortawesome/free-solid-svg-icons';

const IntroPage = ({ onContinue }) => {
    const [showCookieConsent, setShowCookieConsent] = useState(false);
    const [pageBlocked, setPageBlocked] = useState(true);

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


    return (
        <div className="intro-container">
            <Helmet>
                <title>{'Open Security Room'}</title>
                <meta name="description" content="Entre no Open Security Room para criar ou acessar salas de chat seguras e privadas. Junte-se à comunidade e proteja suas conversas online." />
                <meta name="keywords" content="login, registro, chat seguro, privacidade, criptografia, comunidade online, segurança digital" />
                <meta name="author" content="Open Security Room" />
                <meta property="og:title" content='Open Security Room - Login Seguro' />
                <meta property="og:description" content="Participe da Open Security Room para criar ou acessar salas de chat criptografadas. Segurança e privacidade são prioridades." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="URL_da_imagem_de_visualização" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content='Open Security Room - Login Seguro' />
                <meta name="twitter:description" content="Junte-se ao Open Security Room e proteja suas conversas com segurança máxima." />
                <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
                <link rel="canonical" href={window.location.href} />
                <img src="URL_da_imagem_de_visualização" alt="Login seguro no Open Security Room" />
                <img src="URL_da_imagem_de_visualização" alt="Registro seguro no Open Security Room" />
                <link rel="sitemap" type="application/xml" href="sitemap.xml" />
                <meta name="robots" content="index, follow" />
                User-agent: *
                Allow: /
            </Helmet>

            {pageBlocked && <div className="page-blocker"></div>}

            <div className="intro-content mt-4 mb-4">
                <div className="content-left mt-4">
                    <h2>Bem-vindo ao Open Security Room!</h2>
                    <p>
                        Descubra uma nova era de segurança digital! No Open Security Room, sua privacidade não é apenas garantida, é nossa prioridade máxima. Nossa plataforma oferece as ferramentas mais avançadas para proteger suas conversas e garantir que você tenha total controle sobre quem acessa suas informações. Aqui, você navega com tranquilidade, sabendo que está em um ambiente seguro e confiável.
                    </p>
                    <button className="btn btn-outline-warning w-100" onClick={onContinue}>
                        <FontAwesomeIcon icon={faCube} className="me-2" />
                        Inicie sua Experiência Segura
                    </button>

                </div>

                <div className="content-right">
                    <img src={iconPageVisual} alt="OpenSecurityRoom" className="visual-image" />
                </div>
            </div>

            {showCookieConsent && (
                <div className="cookie-consent">
                    <img src={iconPage} alt="Logo" className="cookie-logo" />
                    <p>
                        Este site utiliza cookies para melhorar sua experiência. Ao aceitar, você concorda com o uso de cookies conforme nossa Política de Cookies. Aqui estão algumas maneiras pelas quais usamos cookies:
                    </p>
                    <ul>
                        <li>Segurança e Autenticidade: Garantimos que você permaneça logado de maneira segura durante suas visitas.</li>
                        <li>Análise de Tráfego: Cookies nos ajudam a entender como os usuários interagem com nosso site.</li>
                        <li>Personalização: Cookies permitem que personalizemos sua experiência e ofereçamos conteúdo relevante.</li>
                    </ul>
                    <div className="cookie-buttons">
                        <button onClick={handleCookieConsent} className="btn btn-outline-info">Aceitar Cookies</button>
                        <button onClick={handleCookieDecline} className="btn btn-outline-danger">Recusar Cookies</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntroPage;
