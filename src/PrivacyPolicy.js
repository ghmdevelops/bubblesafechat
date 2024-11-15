import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import iconPage from './components/img/icon-menu.png';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/');
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="privacy-policy-container"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7 }}
        >
            <Helmet>
                <title>Bubble Safe Chat - Política de Privacidade</title>
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

            <header className="privacy-policy-header">
                <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
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
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <h1 className="policy-title">Política de Privacidade</h1>
                <p className="policy-description">
                    No <strong>Bubble Safe Chat</strong>, a privacidade dos nossos usuários é a nossa prioridade. Estamos comprometidos com a proteção dos seus dados pessoais e com a transparência sobre como coletamos, usamos, armazenamos e compartilhamos essas informações. Esta Política de Privacidade descreve detalhadamente como gerenciamos e protegemos os seus dados, em conformidade com as leis de proteção de dados pessoais, incluindo o GDPR (Regulamento Geral de Proteção de Dados da União Europeia) e a LGPD (Lei Geral de Proteção de Dados do Brasil).
                </p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    1. Coleta de Dados
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.3 }}
                >
                    Coletamos uma variedade de dados pessoais e informações não pessoais com o intuito de melhorar a sua experiência de uso e garantir a segurança e o funcionamento da plataforma. Isso inclui, mas não se limita a:
                    <ul>
                        <li><strong>Informações Pessoais Identificáveis (PII):</strong> Coletamos dados como nome, e-mail, número de telefone, endereço, e avatar. Esses dados são usados para autenticar sua conta e personalizar sua experiência na plataforma.</li>
                        <li><strong>Dados de Navegação:</strong> Informações sobre como você acessa nosso serviço, como seu endereço IP, tipo de dispositivo, localização geográfica, tipo de navegador, páginas acessadas, e interações dentro da plataforma.</li>
                        <li><strong>Dados de Mensagens:</strong> O conteúdo das mensagens que você envia e recebe através de nossa plataforma é criptografado para garantir sua privacidade. Nenhum conteúdo é acessado ou utilizado para fins comerciais sem seu consentimento.</li>
                        <li><strong>Cookies e Tecnologias de Rastreamento:</strong> Usamos cookies para melhorar a funcionalidade do site, oferecer uma experiência personalizada e coletar dados sobre o uso da plataforma. Para mais informações sobre como usamos cookies, consulte nossa Política de Cookies.</li>
                    </ul>
                    A coleta de dados é feita de forma transparente e com o devido consentimento do usuário.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.4 }}
                >
                    2. Uso dos Dados
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.5 }}
                >
                    Usamos os dados coletados para fornecer, personalizar e melhorar nossos serviços. Isso inclui:
                    <ul>
                        <li><strong>Autenticação e Registro de Sessão:</strong> Validamos sua identidade e mantemos você conectado na plataforma durante a navegação.</li>
                        <li><strong>Personalização:</strong> Ajustamos a experiência do usuário, incluindo preferências de idioma, configurações de tema, e recomendações.</li>
                        <li><strong>Segurança e Monitoramento:</strong> Monitoramos o tráfego da plataforma para detectar comportamentos suspeitos e prevenir fraudes e ataques cibernéticos.</li>
                        <li><strong>Suporte ao Usuário:</strong> Oferecemos suporte técnico, resolvemos problemas e interagimos com você para garantir a melhor experiência possível.</li>
                    </ul>
                    Todos os dados coletados são tratados de maneira responsável, e tomamos todas as medidas necessárias para proteger sua privacidade e segurança.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.6 }}
                >
                    3. Compartilhamento de Dados
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.7 }}
                >
                    Os dados coletados podem ser compartilhados com terceiros em algumas situações específicas, sempre com o compromisso de proteger sua privacidade e segurança. Isso inclui:
                    <ul>
                        <li><strong>Exigência Legal:</strong> Se formos obrigados a compartilhar dados devido a uma ordem judicial, requisitos legais, ou investigações governamentais.</li>
                        <li><strong>Provedores de Serviços:</strong> Compartilhamos dados com fornecedores essenciais para o funcionamento da plataforma, como serviços de hospedagem, análise de dados, e atendimento ao cliente, sempre sob contratos de confidencialidade.</li>
                        <li><strong>Transferência Internacional de Dados:</strong> Se necessário, seus dados podem ser transferidos e armazenados fora do país onde você reside, em conformidade com as leis de proteção de dados.</li>
                    </ul>
                    Não vendemos, alugamos ou compartilhamos seus dados pessoais com anunciantes ou outras empresas para fins publicitários sem o seu consentimento explícito.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.8 }}
                >
                    4. Segurança dos Dados
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 0.9 }}
                >
                    A segurança dos dados dos usuários é nossa principal prioridade. Implementamos as melhores práticas e tecnologias de segurança para proteger suas informações, incluindo:
                    <ul>
                        <li><strong>Criptografia de Dados:</strong> Todas as mensagens enviadas pela plataforma são criptografadas ponta-a-ponta, garantindo que somente o remetente e o destinatário possam ler o conteúdo.</li>
                        <li><strong>Autenticação Multifatorial:</strong> Oferecemos uma camada adicional de segurança para proteger sua conta contra acessos não autorizados.</li>
                        <li><strong>Proteção Contra Ataques Cibernéticos:</strong> Utilizamos firewalls, sistemas de detecção de intrusão e outras tecnologias avançadas para proteger nossos servidores contra ataques externos.</li>
                    </ul>
                    Embora implementemos medidas de segurança rigorosas, é importante notar que nenhum sistema é 100% seguro. Aconselhamos que você use senhas fortes e ative autenticação multifatorial sempre que possível.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1 }}
                >
                    5. Retenção de Dados
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1.1 }}
                >
                    Retemos seus dados pelo tempo necessário para fornecer nossos serviços, atender a requisitos legais ou cumprir outras obrigações. Quando os dados não são mais necessários, tomamos medidas para excluir ou anonimizar as informações. Dados relacionados a mensagens autodestrutivas são removidos automaticamente conforme configurado pelo usuário. Se você decidir excluir sua conta, todos os dados serão removidos, exceto os registros que precisamos manter por motivos legais.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1.2 }}
                >
                    6. Direitos dos Usuários
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1.3 }}
                >
                    Em conformidade com o <strong>GDPR</strong> e a <strong>LGPD</strong>, você tem os seguintes direitos sobre seus dados pessoais:
                    <ul>
                        <li><strong>Acesso:</strong> Você pode acessar os dados que temos sobre você a qualquer momento.</li>
                        <li><strong>Correção:</strong> Você pode corrigir dados imprecisos ou incompletos.</li>
                        <li><strong>Exclusão:</strong> Você pode solicitar a exclusão dos seus dados pessoais, salvo exceções legais.</li>
                        <li><strong>Portabilidade:</strong> Você pode solicitar a transferência de seus dados para outro serviço, se aplicável.</li>
                        <li><strong>Limitação:</strong> Você pode limitar o processamento de seus dados.</li>
                    </ul>
                    Para exercer esses direitos, entre em contato com nossa equipe de suporte pelo e-mail: <a href="mailto:support@bubblesafechat.com.br">support@bubblesafechat.com.br</a>.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1.4 }}
                >
                    7. Alterações na Política de Privacidade
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1.5 }}
                >
                    Esta política pode ser atualizada periodicamente para refletir mudanças nas leis ou em nossas práticas. Recomendamos que você revise nossa Política de Privacidade regularmente para se manter informado sobre como protegemos seus dados.
                </motion.p>

                <motion.h2
                    className="section-title"
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1.6 }}
                >
                    8. Contato
                </motion.h2>
                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.7, delay: 1.7 }}
                >
                    Se você tiver dúvidas sobre esta Política de Privacidade ou como protegemos seus dados, entre em contato conosco pelo e-mail: <a href="mailto:support@bubblesafechat.com.br">support@bubblesafechat.com.br</a>.
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default PrivacyPolicy;
