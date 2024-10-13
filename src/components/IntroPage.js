import React, { useEffect, useState } from 'react';
import './IntroPage.css';
import iconPage from './img/icon-page.png';
import { Helmet } from 'react-helmet';
import { faLock, faUserShield, faShieldAlt, faRocket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IntroPage = ({ onContinue }) => {
    const [showCookieConsent, setShowCookieConsent] = useState(false);

    useEffect(() => {
        const consentGiven = localStorage.getItem('cookieConsent');
        const consentTimestamp = localStorage.getItem('cookieConsentTimestamp');

        // Verifica se o consentimento já foi dado e se passou uma semana
        if (!consentGiven || (consentTimestamp && (Date.now() - Number(consentTimestamp)) > 7 * 24 * 60 * 60 * 1000)) {
            setShowCookieConsent(true);
        }
    }, []);

    const handleCookieConsent = () => {
        setShowCookieConsent(false);
        localStorage.setItem('cookieConsent', 'true');
        localStorage.setItem('cookieConsentTimestamp', Date.now().toString());
    };

    const handleCookieDecline = () => {
        setShowCookieConsent(false);
        localStorage.setItem('cookieConsent', 'false');
    };

    return (
        <div className="intro-container text-center">
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

            <img
                src={iconPage}
                alt="Ícone de Introdução"
                className="intro-image"
                style={{ width: '100px', animation: 'fadeIn 1s' }}
            />
            <h1 className="highlight-text">
                Bem-vindo ao Open Security Room!
            </h1>
            <p className="intro-description">
                Esta plataforma oferece o mais alto nível de privacidade e segurança para suas salas de chat. Aqui, você pode se sentir seguro e no controle.
            </p>
            <div className="benefits-list mt-2">
                <h2 className="benefits-title mb-4">Por que escolher o Open Security Room?</h2>
                <p>Nosso compromisso é garantir que você tenha a melhor experiência possível. Aqui estão alguns dos benefícios de usar nossa plataforma:</p>
                <li>
                    <FontAwesomeIcon icon={faLock} className="me-2" />
                    <strong>Privacidade Total:</strong> Seus dados são criptografados e nunca serão compartilhados. Garantimos que todas as suas conversas estão protegidas com a mais alta segurança disponível, mantendo sua privacidade intacta.
                </li>
                <li>
                    <FontAwesomeIcon icon={faUserShield} className="me-2" />
                    <strong>Gerenciamento de Permissões:</strong> Você tem controle total sobre quem pode entrar na sua sala e quem participa das conversas. Controle granular de acesso para garantir a segurança do ambiente.
                </li>
                <li>
                    <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
                    <strong>Segurança Robusta:</strong> Utilizamos criptografia de ponta a ponta e várias camadas de segurança para garantir que suas informações permaneçam seguras e longe de invasores.
                </li>
                <li>
                    <FontAwesomeIcon icon={faRocket} className="me-2" />
                    <strong>Simplicidade:</strong> A interface foi projetada para ser fácil de usar, mesmo para iniciantes. Você pode acessar e gerenciar suas salas com apenas alguns cliques, sem complicações.
                </li>
            </div>
            <p>
                Clique em <b className='regisText' onClick={onContinue}>Login</b> para prosseguir para o login ou inscrever-se.
            </p>

            {showCookieConsent && (
                <div className="cookie-consent">
                    <h3>Aviso de Cookies</h3>
                    <p>
                        Este site utiliza cookies para melhorar sua experiência. Os cookies são pequenos arquivos de texto que são armazenados no seu dispositivo quando você visita um site. Eles ajudam a lembrar suas preferências e fornecem informações sobre como você interage com o site.
                    </p>
                    <p>
                        Ao aceitar, você concorda com o uso de cookies conforme nossa Política de Cookies. Aqui estão algumas maneiras pelas quais usamos cookies:
                    </p>
                    <ul>
                        <li>Segurança e Autenticidade: Utilizamos cookies para garantir que você permaneça logado de maneira segura durante suas visitas.</li>
                        <li>Análise de Tráfego: Cookies nos ajudam a entender como os usuários interagem com nosso site, permitindo-nos melhorar continuamente a experiência do usuário.</li>
                        <li>Personalização: Cookies permitem que personalizemos sua experiência, lembrando suas preferências e oferecendo conteúdo relevante.</li>
                    </ul>
                    <p>
                        Nossa plataforma foi projetada com a segurança em mente. Aqui estão as medidas que tomamos para proteger seus dados:
                    </p>
                    <ul>
                        <li><strong>Proteção contra acesso não autorizado:</strong> Somente usuários autenticados podem acessar suas salas de chat, e utilizamos autenticação multifator para aumentar a segurança.</li>
                        <li><strong>Criptografia de ponta a ponta:</strong> Suas comunicações são criptografadas, assegurando que somente você e os participantes da sala possam ler as mensagens.</li>
                        <li><strong>Notificações de atividades suspeitas:</strong> Informamos você sobre tentativas de login não reconhecidas para que você possa agir rapidamente em caso de acesso não autorizado.</li>
                        <li><strong>Conformidade com regulamentos:</strong> Estamos em conformidade com as leis de proteção de dados, como o GDPR, garantindo que seus dados sejam tratados de forma ética e segura.</li>
                    </ul>
                    <div className="cookie-buttons">
                        <button onClick={handleCookieConsent} className="btn btn-primary">Aceitar Cookies</button>
                        <button onClick={handleCookieDecline} className="btn btn-secondary">Recusar Cookies</button>
                    </div>
                </div>
            )}

            <p className="intro-features-title d-none">Recursos</p>
            <ul className="intro-features-list mb-4 d-none">
                <li>Segurança de ponta a ponta para suas comunicações.</li>
                <li>Controle total sobre sua privacidade e dados.</li>
                <li>Interface intuitiva e fácil de usar.</li>
                <li>Ferramentas de personalização para se adequar às suas necessidades.</li>
                <li>Acesso em qualquer lugar, a qualquer hora.</li>
                <li>Suporte 24/7 para resolver suas dúvidas e problemas.</li>
            </ul>
        </div>
    );
}

export default IntroPage;
