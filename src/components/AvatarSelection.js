import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { database, auth } from '../firebaseConfig';
import './AvatarSelection.css';
import '@sweetalert2/theme-dark/dark.css';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import iconPage from './img/icon-menu.png';
import { Helmet } from 'react-helmet';

const AvatarSelection = () => {
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { roomName, encryptionKey } = location.state;

    const avatarOptions = [
        'https://img.icons8.com/fluency/48/apple-arcade.png',
        'https://img.icons8.com/color/48/ghost--v1.png',
        'https://img.icons8.com/color/48/legolas.png',
        'https://img.icons8.com/color/48/gollum.png',
        'https://img.icons8.com/color/48/vulcan-head.png',
        'https://img.icons8.com/color/48/luke-skywalker.png',
        'https://img.icons8.com/external-flat-icons-inmotus-design/67/external-droid-star-wars-flat-icons-inmotus-design.png',
        'https://img.icons8.com/emoji/48/man.png',
        'https://img.icons8.com/fluency/48/businessman--v1.png',
        'https://img.icons8.com/office/40/businesswoman.png',
        'https://img.icons8.com/color/48/person-female-skin-type-7.png',
        'https://img.icons8.com/stickers/50/storm-marvel--v6.png',
        'https://img.icons8.com/avantgarde/100/cyclop-marvel.png',
        'https://img.icons8.com/color/48/cyclop-marvel.png',
        'https://img.icons8.com/color/48/spiderman-head.png',
        'https://img.icons8.com/color/48/thanos.png'
    ];

    const handleAvatarSelection = (avatar) => {
        setSelectedAvatar(avatar);
    };

    const saveAvatarSelection = async () => {
        if (selectedAvatar) {
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const roomRef = database.ref(`rooms/${roomName}`);
                    await roomRef.update({
                        avatar: selectedAvatar,
                        updatedAt: new Date().toISOString(),
                    });

                    navigate(`/room/${roomName}`, { state: { roomName, encryptionKey, avatar: selectedAvatar } });
                } catch (error) {
                    console.error('Erro ao salvar o avatar:', error);
                }
            }
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="container mt-5">
            <Helmet>
                <title>Bubble Safe Chat - Avatar</title>
                <meta name="description" content="Entre no Bubble Safe Chat para criar ou acessar salas de chat seguras e privadas. Junte-se à comunidade e proteja suas conversas online." />
                <meta name="keywords" content="login, registro, chat seguro, privacidade, criptografia, comunidade online, segurança digital" />
                <meta name="author" content="Bubble Safe Chat" />
                <meta property="og:title" content='Bubble Safe Chat - Login Seguro' />
                <meta property="og:description" content="Participe da Bubble Safe Chat para criar ou acessar salas de chat criptografadas. Segurança e privacidade são prioridades." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:image" content="URL_da_imagem_de_visualização" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content='Bubble Safe Chat - Login Seguro' />
                <meta name="twitter:description" content="Junte-se ao Bubble Safe Chat e proteja suas conversas com segurança máxima." />
                <meta name="twitter:image" content="URL_da_imagem_de_visualização" />
                <link rel="canonical" href={window.location.href} />
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
            </Helmet>

            <header>
                <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
                    <div className="container-fluid">
                        <img
                            className="navbar-brand img-fluid responsive-img"
                            src={iconPage}
                            alt="OpenSecurityRoom"
                        />
                        <button className="navbar-toggler bg-black" type="button" data-toggle="collapse" data-target="#navbarCollapse"
                            aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarCollapse">
                            <ul className="navbar-nav ms-auto mb-2 mb-md-0">
                                <div className="text-center mt-3">
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={handleBack}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <div className="container mt-5 pt-5">
                <div className="text-center mb-4 animated-title">
                    <h2 style={{ fontWeight: "500" }} className="display-6 animated fadeInUp">Escolha seu Avatar</h2>
                    <p className="lead animated fadeInLeft delay-1s">Selecione um avatar para personalizar sua experiência no chat.</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-md-8 d-flex justify-content-around flex-wrap">
                        {avatarOptions.map((avatar, index) => (
                            <img
                                key={index}
                                src={avatar}
                                alt={`Avatar ${index + 1}`}
                                className={`avatar-item rounded-circle shadow ${selectedAvatar === avatar ? 'selected990' : ''}`}
                                onClick={() => handleAvatarSelection(avatar)}
                                style={selectedAvatar === avatar ? { border: '4px solid #6495ED' } : {}}
                            />
                        ))}
                    </div>
                </div>


                {selectedAvatar && (
                    <div className="text-center mt-4 animated-button">
                        <button
                            className="btn btn-outline-warning btn-lg animate__animated animate__pulse animate__infinite"
                            onClick={saveAvatarSelection}
                        >
                            <FontAwesomeIcon icon={faDoorOpen} className="me-2" />
                            Go Room
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarSelection;
