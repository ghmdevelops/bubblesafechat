import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LearnMorePage.css';
import imagePage from './components/img/icon-page.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { Helmet } from 'react-helmet';

const LearnMorePage = () => {
    const navigate = useNavigate();

    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="learn-more-container">

            <Helmet>
                <title>Bubble Safe Chat - Saiba Mais</title>
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
            </Helmet>

            <div className='container-page-titles'>
                <b className="page-titles-learn"><img onClick={goToLogin} className='img-learn' src={imagePage} alt="bubblesafechat" /> Bubble Safe Chat</b>
            </div>
            <p className="page-description">
                O <strong>Bubble Safe Chat</strong> é a sua solução definitiva para comunicação online segura e privada.
                Nossa plataforma foi projetada para proteger seus dados a cada etapa, oferecendo segurança de nível mundial e funcionalidades avançadas para manter suas conversas e informações pessoais sob total controle.
            </p>
            <h2 className="section-title">O que o Bubble Safe Chat oferece?</h2>
            <ul className="features-list">
                <li>
                    <strong>Criptografia Avançada:</strong> Todas as conversas são protegidas por criptografia de ponta a ponta,
                    garantindo que somente você e o destinatário possam acessar o conteúdo. Mesmo em redes públicas,
                    suas informações estarão completamente seguras.
                </li>
                <li>
                    <strong>Mensagens Protegidas com Senha:</strong> Adicione uma camada extra de segurança às suas mensagens,
                    configurando senhas personalizadas. Somente os usuários com a senha correta poderão visualizar
                    o conteúdo, garantindo proteção máxima.
                </li>
                <li>
                    <strong>Controle Total:</strong> No Bubble Safe Chat, você tem controle completo sobre suas salas de chat.
                    Defina quem pode entrar, quanto tempo as mensagens permanecerão disponíveis, e configure a
                    autodestruição automática das mensagens após um período definido. Isso permite que você tenha
                    a certeza de que suas conversas são temporárias e seguras.
                </li>
                <li>
                    <strong>Autodestruição de Mensagens:</strong> Configure mensagens para serem autodestruídas automaticamente
                    após visualização ou após um período determinado. Isso garante que nenhuma mensagem fique
                    armazenada além do necessário, proporcionando ainda mais privacidade.
                </li>
                <li>
                    <strong>Exclusão de Conta:</strong> Você pode excluir sua conta e todos os dados associados a qualquer
                    momento. Ao deletar a conta, todas as mensagens, informações e históricos de conversas são
                    permanentemente apagados dos nossos servidores.
                </li>
                <li>
                    <strong>Fale e Escreva:</strong> Com nossa funcionalidade de reconhecimento de voz, você pode simplesmente
                    falar e o sistema transcreve sua fala em mensagens. Isso facilita a comunicação rápida e eficiente,
                    especialmente em dispositivos móveis.
                </li>
                <li>
                    <strong>Compartilhamento via QR Code:</strong> Crie salas de chat de maneira rápida e compartilhe o acesso por
                    meio de QR codes. Essa funcionalidade oferece praticidade e segurança, evitando links longos ou
                    fáceis de interceptar.
                </li>
                <li>
                    <strong>Segurança em Camadas:</strong> Utilizamos diversas camadas de segurança, incluindo firewalls avançados,
                    autenticação multifator, e detecção de intrusões. Desde a autenticação até a transmissão de dados, cada
                    etapa é protegida contra ameaças e ataques cibernéticos.
                </li>
                <li>
                    <strong>Desempenho de Alta Velocidade:</strong> Mesmo em redes lentas, o Bubble Safe Chat oferece uma
                    experiência fluida e rápida, garantindo que você possa se comunicar sem interrupções ou atrasos.
                </li>
                <li>
                    <strong>Anonimato Garantido:</strong> Com a opção de anonimato, você pode conversar sem precisar
                    fornecer informações pessoais. Nenhum dado identificável é compartilhado, garantindo privacidade
                    total nas suas interações.
                </li>
            </ul>

            <h2 className="section-title">Segurança de Ponta a Ponta</h2>
            <p className="page-description">
                A segurança é o coração do <strong>Bubble Safe Chat</strong>. Utilizamos criptografia de ponta a ponta em todas as conversas, o que significa que nem mesmo nossos servidores têm acesso ao conteúdo das mensagens. Além disso, adotamos uma arquitetura de segurança em camadas:
            </p>
            <ul className="features-list">
                <li>
                    Cada acesso é autenticado de forma segura, com verificação multifatorial para garantir que apenas usuários autorizados possam acessar as salas de chat.
                </li>
                <li>
                    Firewalls e sistemas de detecção de intrusão protegem a plataforma contra ataques externos.
                </li>
                <li>
                    Controles avançados de privacidade permitem que você defina quem pode acessar suas mensagens, por quanto tempo elas permanecem disponíveis, e se podem ser copiadas ou compartilhadas.
                </li>
                <li>
                    Realizamos auditorias de segurança regulares para garantir que nossa plataforma esteja sempre protegida contra as últimas ameaças.
                </li>
            </ul>

            <h2 className="section-title">Por que escolher o Bubble Safe Chat?</h2>
            <p className="page-description">
                O <strong>Bubble Safe Chat</strong> é a melhor escolha para quem busca uma comunicação online privada, segura e eficiente. Nossa plataforma é fácil de usar, com funcionalidades avançadas para manter suas conversas protegidas.
                Além disso, oferecemos suporte contínuo e garantimos um tempo de atividade de 99,9%, assegurando que suas conversas nunca sejam interrompidas. Seja para uso pessoal ou profissional, o Bubble Safe Chat oferece as ferramentas que você precisa para manter suas informações seguras e privadas.
            </p>

            <div className="button-container">
                <button className="btn btn-primary btn-lg learn-more-button w-100" onClick={goToLogin}>
                    <FontAwesomeIcon icon={faUser} className="me-1" />
                </button>
            </div>
        </div>
    );
};

export default LearnMorePage;
