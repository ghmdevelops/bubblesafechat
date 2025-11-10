import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import iconMenu from './img/icon-page.png'; // IMPORTAÇÃO DO ÍCONE

const MobileCtaModal = ({ show, handleClose, handleInstall, canInstall }) => {
    const navigate = useNavigate();

    const handleGoToPlans = () => {
        handleClose();
        navigate('/planos');
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header
                closeButton
                className="bg-dark text-light border-secondary"
                data-bs-theme="dark" // FORÇA O ÍCONE DE FECHAR PARA BRANCO
            >
                <Modal.Title className="d-flex align-items-center">
                    <img
                        src={iconMenu}
                        alt="Menu Icon"
                        style={{ width: '74px', height: '74px', marginRight: '10px' }}
                    />
                    <span style={{ color: '#63b3ed', fontWeight: 700, fontSize: '1.5rem' }}>
                        Experiência Otimizada para Mobile
                    </span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-light">
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.15rem', marginBottom: '12px' }}>
                        Desbloqueie todos os recursos e desfrute de uma navegação mais rápida e segura.
                    </p>
                    <p style={{ fontSize: '0.95rem', marginBottom: '25px', color: '#a0a0a0' }}>
                        Instale o aplicativo progressivo (PWA) para acesso instantâneo.
                    </p>

                    <Button
                        variant="info"
                        onClick={handleGoToPlans}
                        className="mb-3 w-75"
                        style={{ fontWeight: 600, borderRadius: '12px' }}
                    >
                        💰 Conhecer Planos
                    </Button>

                    {canInstall && (
                        <Button
                            variant="success"
                            onClick={handleInstall}
                            className="w-75"
                            style={{ fontWeight: 600, borderRadius: '12px' }}
                        >
                            📲 Instalar App
                        </Button>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default MobileCtaModal;