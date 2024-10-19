import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './IntroPage.css';
import { motion } from 'framer-motion';
import iconPage from './img/icon-page.png';
import iconPageVisual from './img/StockCake-Cybersecurity.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons';
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

    const cardsData = [
        {
            id: 1,
            title: 'Criptografia Avançada',
            description: 'Proteja suas conversas com a tecnologia de criptografia de ponta a ponta, garantindo que somente você e o destinatário tenham acesso ao conteúdo. Nossa criptografia moderna impede qualquer tentativa de interceptação, mantendo todas as informações completamente seguras. Esse nível de proteção é utilizado nas maiores plataformas de comunicação do mundo, proporcionando uma camada adicional de confiança. Além disso, você pode personalizar a criptografia para diferentes conversas, adaptando o nível de segurança conforme necessário. Mantenha sua privacidade intacta, mesmo em redes públicas ou ambientes suscetíveis a ataques. Com nossa solução, suas comunicações nunca foram tão seguras.',
            image: 'https://images.pexels.com/photos/6964173/pexels-photo-6964173.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            id: 2,
            title: 'Controle Total',
            description: 'Você tem o controle absoluto sobre suas salas de chat! Decida quem pode entrar, defina o tempo de permanência das mensagens e gerencie todos os aspectos da conversa. Se preferir, configure mensagens que se autodestruam após um período ou limite o número de participantes. Com recursos avançados de gerenciamento, você pode criar ambientes seguros e personalizáveis para diferentes grupos e finalidades. A segurança de quem entra e quem sai é totalmente ajustável por você, e as opções de controle são amplas, garantindo que suas conversas permaneçam exatamente do jeito que deseja. Seja para bate-papos privados ou grupos maiores, o poder está nas suas mãos.',
            image: 'https://images.pexels.com/photos/5496459/pexels-photo-5496459.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            id: 3,
            title: 'Anonimato Garantido',
            description: 'Converse com total liberdade sabendo que sua identidade está protegida a cada mensagem enviada. Nosso sistema foi desenvolvido para assegurar que nem mesmo nós, como plataforma, possamos acessar ou rastrear suas conversas. Você pode optar por nomes de usuário anônimos e ocultar suas informações pessoais de todos os outros participantes. Além disso, todos os registros de suas conversas podem ser apagados permanentemente conforme sua preferência. Mantenha-se protegido em todas as interações, sem deixar rastros. A política de privacidade foi projetada para garantir que você seja o único com controle sobre seus dados, trazendo segurança e tranquilidade em cada conversa.',
            image: 'https://images.pexels.com/photos/5520710/pexels-photo-5520710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        },
        {
            id: 4,
            title: 'Compartilhamento Fácil',
            description: 'Crie salas de chat em questão de segundos e compartilhe o acesso via QR code de forma rápida e segura. Convite seus amigos ou colegas apenas escaneando o código com seus dispositivos, sem a necessidade de longos links ou processos complicados. Nosso sistema oferece praticidade, permitindo que você distribua convites para grandes grupos de maneira eficiente. O QR code gerado é único para cada sala, garantindo que somente pessoas autorizadas possam participar. Esta tecnologia também oferece uma camada adicional de segurança, pois os links não podem ser facilmente replicados. Com isso, compartilhar acesso a conversas privadas nunca foi tão seguro e ágil.',
            image: 'https://images.pexels.com/photos/3585088/pexels-photo-3585088.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        },
        {
            id: 5,
            title: 'Segurança em Camadas',
            description: 'Nossas múltiplas camadas de segurança oferecem proteção robusta contra qualquer tipo de ameaça digital. Cada etapa de comunicação é protegida por firewalls avançados, detecção de intrusões e criptografia de alto nível, tornando impossível qualquer brecha. Desde a autenticação de usuários até a transmissão de dados, aplicamos as melhores práticas de segurança para garantir que todas as informações estejam totalmente protegidas. Cada camada foi projetada para resistir a ataques específicos, desde tentativas de phishing até hackers sofisticados. Além disso, revisões de segurança regulares garantem que suas conversas estejam sempre protegidas contra novas ameaças. Uma segurança sólida, pensada em cada detalhe.',
            image: 'https://images.pexels.com/photos/3861976/pexels-photo-3861976.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            id: 6,
            title: 'Desempenho de Alta Velocidade',
            description: 'Com nossa infraestrutura de alto desempenho, você desfruta de comunicações rápidas, seguras e sem interrupções, mesmo em redes mais lentas. Utilizamos os mais recentes avanços em tecnologia de rede para reduzir a latência e otimizar a velocidade de envio e recebimento de mensagens. Independentemente da quantidade de usuários conectados ou do tamanho da sala de chat, garantimos uma experiência fluida e sem atrasos. Além disso, nossa plataforma é otimizada para dispositivos móveis e desktop, permitindo uma comunicação eficaz em qualquer ambiente. Mantenha suas conversas sempre ágeis, com uma infraestrutura projetada para desempenho superior.',
            image: 'https://images.pexels.com/photos/1821411/pexels-photo-1821411.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            id: 7,
            title: 'Confiabilidade Comprovada',
            description: 'Nossa plataforma garante um uptime de mais de 99.9%, com servidores localizados estrategicamente ao redor do mundo para garantir alta disponibilidade. Seja para conversas importantes ou grandes eventos, você pode confiar em nossa infraestrutura para manter tudo funcionando sem interrupções. Backup de dados em tempo real e recuperação automática em caso de falhas garantem que nada será perdido. Nossos servidores são constantemente monitorados para evitar qualquer tempo de inatividade inesperado. E, em caso de necessidade de manutenção, ela é feita de forma transparente, sem impacto nas suas conversas. Confiabilidade que você pode contar, sempre que precisar.',
            image: 'https://images.pexels.com/photos/9017586/pexels-photo-9017586.jpeg?auto=compress&cs=tinysrgb&w=600',
        },
        {
            id: 15,
            title: 'Privacidade Personalizada',
            description: 'Personalize suas configurações de privacidade com base nas suas preferências e necessidades específicas. Escolha quem pode ver suas mensagens, por quanto tempo elas ficarão disponíveis e se os participantes podem baixar ou compartilhar o conteúdo. Além disso, você pode definir níveis de anonimato para conversas específicas ou grupos inteiros, garantindo que as informações sensíveis fiquem acessíveis apenas para quem você permitir. Nossas configurações flexíveis colocam você no controle de tudo, desde o acesso aos dados até a forma como eles são armazenados. Ajuste a privacidade de acordo com cada situação, e mantenha total controle das suas informações pessoais.',
            image: 'https://images.pexels.com/photos/5077062/pexels-photo-5077062.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1 ',
        },
        {
            id: 19,
            title: 'Segurança Zero-Trust',
            description: 'Adotamos a arquitetura de segurança Zero-Trust, onde cada acesso é rigorosamente verificado, garantindo a máxima proteção para você e seus dados. Mesmo os dispositivos conhecidos e os usuários autenticados precisam ser constantemente revalidados, criando uma barreira impenetrável contra invasores. Esse modelo de segurança moderno e robusto garante que nenhum dado será comprometido, não importa o quão sofisticado seja o ataque. Além disso, toda a comunicação entre o servidor e o cliente é protegida por autenticação multifator e criptografia avançada. Segurança total em todas as camadas, sem deixar brechas, e com total tranquilidade para quem utiliza a plataforma.',
            image: 'https://images.pexels.com/photos/1054397/pexels-photo-1054397.jpeg?auto=compress&cs=tinysrgb&w=600',
        }
    ];

    return (
        <div className="intro-container">
            <Helmet>
                <title>Bubble Safe Chat - Segurança Total para Suas Conversas</title>
                <meta name="description" content="Entre no Bubble Safe Chat para criar ou acessar salas de chat seguras e privadas. Junte-se à comunidade e proteja suas conversas online com criptografia de ponta a ponta." />
                <meta name="keywords" content="chat seguro, privacidade, criptografia, salas de chat, segurança online, comunidade, criptografia avançada, conversas privadas" />
                <meta name="author" content="Bubble Safe Chat" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
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
            </Helmet>

            {pageBlocked && <div className="page-blocker"></div>}

            <motion.div
                className="intro-content mt-4 mb-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
                <motion.div
                    className="content-left mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                >
                    <h2>Bem-vindo ao Bubble Safe Chat!</h2>
                    <p>
                        Experimente o futuro da comunicação segura com o Bubble Safe Chat. Sua privacidade não é apenas
                        garantida, é nossa prioridade número um. Com tecnologia de ponta, garantimos que todas as suas
                        conversas sejam protegidas por criptografia avançada, permitindo que você controle completamente
                        quem tem acesso às suas informações. Entre em um ambiente digital seguro e aproveite a
                        tranquilidade ao conversar online.
                    </p>
                    <motion.div
                        className="login-section mt-5"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <h3>Já tem uma conta?</h3>
                        <p>Junte-se a nós e faça parte da revolução na comunicação segura. No Bubble Safe Chat, sua
                            privacidade é levada a sério!</p>
                        <motion.button
                            style={{ height: '50px' }}
                            className="btn btn-primary w-100"
                            onClick={onContinue}
                            whileHover={{ backgroundColor: '#0056b3' }}
                            transition={{ duration: 0.3 }}
                        >
                            <FontAwesomeIcon icon={faSignInAlt} className="me-3" style={{ fontSize: '1.2em' }} />
                            Acessar Minha Conta
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

            <motion.div className='mb-2'>
                <b>Sua privacidade, nosso compromisso: comunique-se com segurança, rapidez e total controle</b>
            </motion.div>

            <div className="cards-section container mt-5">
                {cardsData.map((card, index) => (
                    <motion.div
                        className="card mb-4 shadow-sm text-white"
                        key={card.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.8, ease: 'easeInOut' }}
                        whileHover={{ scale: 1.05 }}
                        style={{ background: 'transparent' }}
                    >
                        <div className="row g-0">
                            <div className="col-md-4">
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="img-fluid rounded-start card-image"
                                />
                            </div>
                            <div className="col-md-8 card-td">
                                <div className="card-body">
                                    <h5 className="card-title">{card.title}</h5>
                                    <p className="card-text">{card.description}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

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
                            </a>
                            .
                        </p>
                        <ul>
                            <li>Garantir que sua sessão seja mantida de forma segura.</li>
                            <li>Analisar o tráfego para entender como você utiliza nosso site.</li>
                            <li>Personalizar conteúdo e melhorar a experiência do usuário.</li>
                        </ul>
                        <div className="cookie-buttons mt-4 d-flex justify-content-between btn-cooki">
                            <button onClick={handleCookieConsent} className="btn btn-primary ac">
                                Aceitar Cookies
                            </button>
                            <button onClick={handleCookieDecline} className="btn btn-primary rc">
                                Recusar Cookies
                            </button>
                        </div>
                    </motion.div>
                )
            }
        </div >
    );
};

export default IntroPage;
