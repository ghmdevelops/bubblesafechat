import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CookiePolicy.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import iconPage from './components/img/icon-menu.png';

const CookiePolicy = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/');
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="cookie-policy-container"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
        >
            <Helmet>
                <title>Bubble Safe Chat - Política de Cookies</title>
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
            </Helmet>

            <header className="cookie-policy-header">
                <nav className="navbar navbar-expand-md navbar-black fixed-top bg-black">
                    <div className="container-fluid">
                    <img className="navbar-brand img-fluid responsive-img" src={iconPage} alt="Bubble Safe Chat" />
                        <motion.button
                            className="btn btn-outline-info ms-auto"
                            onClick={goToHome}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} /> 
                        </motion.button>
                    </div>
                </nav>
            </header>

            <motion.div
                className="policy-content mt-5 pt-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <h1 className="policy-title">Política de Cookies</h1>
                <p className="policy-description">
                    No <strong>Bubble Safe Chat</strong>, valorizamos a sua privacidade e a transparência no uso de dados. Esta Política de Cookies explica o que são cookies, como os utilizamos e as suas opções em relação ao uso de cookies em nosso site, em conformidade com regulamentações como o GDPR e a LGPD.
                </p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    O que são Cookies?
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    Cookies são pequenos arquivos de texto armazenados no seu dispositivo quando você visita um site. Eles servem para lembrar suas preferências, como idioma ou configurações de exibição, facilitando a navegação e aprimorando sua experiência online.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    Como usamos os Cookies?
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    Utilizamos cookies para oferecer uma experiência mais personalizada, entender como o site é utilizado, e fornecer funcionalidades essenciais. Estes cookies podem coletar dados como o endereço IP, navegador, e dispositivo utilizado, seguindo as regulamentações de proteção de dados.
                </motion.p>

                <motion.h3
                    className="sub-section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    Tipos de Cookies que Utilizamos
                </motion.h3>
                <ul className="cookie-list">
                    {[
                        { name: 'Cookies Necessários', description: 'Essenciais para o funcionamento do site, permitindo a navegação e o uso de recursos de forma segura.' },
                        { name: 'Cookies de Desempenho', description: 'Coletam informações sobre como os visitantes usam o site, ajudando-nos a melhorar a funcionalidade e desempenho.' },
                        { name: 'Cookies de Funcionalidade', description: 'Lembram as preferências e escolhas do usuário, como idioma e localização, para uma experiência personalizada.' },
                        { name: 'Cookies de Publicidade', description: 'Usados para apresentar anúncios relevantes, rastreando a eficácia de campanhas e personalizando o conteúdo.' },
                    ].map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                        >
                            <strong>{item.name}:</strong> {item.description}
                        </motion.li>
                    ))}
                </ul>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    Seus Direitos e Opções
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 0.9 }}
                >
                    Em conformidade com o GDPR e a LGPD, você tem o direito de aceitar ou recusar cookies. Ao acessar nosso site, você pode gerenciar suas preferências de cookies, com opções para desativar cookies não essenciais. Isso pode impactar a funcionalidade do site.
                </motion.p>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1 }}
                >
                    Para desativar cookies diretamente no navegador, siga as instruções para o seu navegador:
                </motion.p>
                <ul className="cookie-list">
                    <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
                    <li><a href="https://support.mozilla.org/pt-BR/kb/ativando-e-desativando-cookies" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
                    <li><a href="https://support.microsoft.com/pt-br/help/17442/windows-internet-explorer-delete-manage-cookies" target="_blank" rel="noopener noreferrer">Internet Explorer</a></li>
                    <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
                </ul>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.2 }}
                >
                    Privacidade e Proteção de Dados
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.3 }}
                >
                    O <strong>Bubble Safe Chat</strong> segue os princípios do GDPR e da LGPD para garantir a segurança e a privacidade dos seus dados pessoais. Utilizamos mecanismos de segurança avançados para proteger suas informações contra acesso não autorizado e mantemos os dados apenas pelo tempo necessário para os fins especificados.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.4 }}
                >
                    Alterações nesta Política
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.5 }}
                >
                    Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças nas leis ou em nossas práticas. Recomendamos que você revise esta política regularmente para se manter informado sobre como utilizamos cookies e protegemos seus dados.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.6 }}
                >
                    Contato
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.5, delay: 1.7 }}
                >
                    Se tiver dúvidas sobre esta Política de Cookies ou sobre a forma como usamos seus dados, entre em contato conosco pelo e-mail: <a href="mailto:support@bubblesafechat.com.br">contato@bubblesafechat.com.br</a>.
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default CookiePolicy;
