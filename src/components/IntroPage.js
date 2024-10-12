import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import './IntroPage.css';
import iconPage from './img/icon-page.png';
import { Helmet } from 'react-helmet';

const IntroPage = ({ onContinue }) => {
    return (
        <div className="intro-container text-center">
            <Helmet>
                <title>{'Open Security Room - Home'}</title>
                <meta name="description" content="Faça login para acessar suas salas de chat na Open Security Room ou crie uma nova conta para se juntar à comunidade." />
                <meta name="keywords" content="login, registro, chat, segurança, comunidade" />
                <meta name="author" content="Open Security Room" />
                <meta property="og:title" content={'Open Security Room - Chat'} />
                <meta property="og:description" content="Acesse suas salas de chat ou crie uma nova conta na Open Security Room." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="URL_da_imagem_de_visualização" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={'Open Security Room - Chat'} />
                <meta name="twitter:description" content="Acesse suas salas de chat ou crie uma nova conta na Open Security Room." />
                <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
                <link rel="canonical" href={window.location.href} />
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
            </Helmet>

            <img
                src={iconPage}
                alt="Ícone de Introdução"
                className="intro-image"
                style={{ width: '100px', animation: 'fadeIn 1s' }}
            />
            <h1 className="highlight-text">
                <FontAwesomeIcon icon={faShieldAlt} className="me-2" style={{ color: '#fff' }} />
                Bem-vindo ao Open Security Room!
            </h1>
            <p className="intro-description">
                Esta plataforma oferece o mais alto nível de privacidade e segurança para suas salas de chat.
                Aqui, você pode se sentir seguro e no controle.
            </p>
            <div className="intro-benefits">
                <h2 className="benefits-title mb-4">Por que escolher o Open Security Room?</h2>
                <p>Nosso compromisso é garantir que você tenha a melhor experiência possível. Aqui estão alguns dos benefícios de usar nossa plataforma:</p>
                <ul className="benefits-list">
                    <li>🔒 <strong>Privacidade Total:</strong> Seus dados são criptografados e nunca serão compartilhados.</li>
                    <li>💡 <strong>Simplicidade:</strong> A interface foi projetada para ser fácil de usar, mesmo para iniciantes.</li>
                    <li>🌟 <strong>Confiabilidade:</strong> Com um uptime de 99,9%, suas conversas estarão sempre disponíveis.</li>
                </ul>
            </div>
            <p>
                <FontAwesomeIcon icon={faLock} className="me-2" />
                Clique em <b className='regisText' onClick={onContinue}>Login</b> para prosseguir para o login ou inscrever-se.
            </p>

            <p className="intro-features-title d-none">Recursos</p>
            <ul className="intro-features-list mb-4 d-none">
                <li>🔒 Segurança de ponta a ponta para suas comunicações.</li>
                <li>🔍 Controle total sobre sua privacidade e dados.</li>
                <li>💬 Interface intuitiva e fácil de usar.</li>
                <li>🛠️ Ferramentas de personalização para se adequar às suas necessidades.</li>
                <li>🌍 Acesso em qualquer lugar, a qualquer hora.</li>
                <li>📞 Suporte 24/7 para resolver suas dúvidas e problemas.</li>
            </ul>
        </div>
    );
}

export default IntroPage;
