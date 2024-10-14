import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const NotFound = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Helmet>
                <title>{'Bubble Safe Chat'}</title>
                <meta name="description" content="Faça login para acessar suas salas de chat na Bubble Safe Chat ou crie uma nova conta para se juntar à comunidade." />
                <meta name="keywords" content="login, registro, chat, segurança, comunidade" />
                <meta name="author" content="Bubble Safe Chat" />
                <meta property="og:title" content={'Bubble Safe Chat - Chat'} />
                <meta property="og:description" content="Acesse suas salas de chat ou crie uma nova conta na Bubble Safe Chat." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="URL_da_imagem_de_visualização" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={'Bubble Safe Chat - Chat'} />
                <meta name="twitter:description" content="Acesse suas salas de chat ou crie uma nova conta na Bubble Safe Chat." />
                <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
                <link rel="canonical" href={window.location.href} />
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
            </Helmet>

            <h1 className="text-danger">Página não encontrada!</h1>
            <p className="text-center">A página que você está procurando não existe.</p>
        </div>
    );
};

export default NotFound;
