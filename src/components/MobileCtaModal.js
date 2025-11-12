import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import iconMenu from './img/name.png';
import './MobileCtaModal.css';
import { motion } from 'framer-motion'; // Importação do motion

const MobileCtaModal = ({ show, handleClose, handleInstall, canInstall }) => {
    const navigate = useNavigate();

    const handleGoToPlans = () => {
        handleClose();
        navigate('/planos');
    };

    // --- Lógica de Dados Dinâmicos ---
    const [activeUsers, setActiveUsers] = useState(1570);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveUsers(prev => prev + Math.floor(Math.random() * 5));
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const formattedUsers = activeUsers.toLocaleString('pt-BR');

    const accentColor = 'var(--accent-color-premium, #11afedff)';

    // Variantes de animação para os elementos
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    };

    // Variantes de animação para o contêiner principal (para criar o efeito cascata)
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
    };

    // --- Componente de Métrica para ser injetado no Modal ---
    const MetricBar = () => (
        // motion.div dentro do fluxo principal de staggering
        <motion.div
            className="metric-bar mb-4 w-100"
            variants={itemVariants} // Usando a variante padrão
        >
            <div className="metric-item">
                <span className="metric-value" style={{ color: accentColor }}>{formattedUsers}+</span>
                <span className="metric-label">Usuários Ativos</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
                <span className="metric-value" style={{ color: accentColor }}>99.9%</span>
                <span className="metric-label">SLA Garantido</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
                <span className="metric-value" style={{ color: accentColor }}>30 Dias</span>
                <span className="metric-label">Garantia</span>
            </div>
        </motion.div>
    );
    // -----------------------------------------------------

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="sm"
            dialogClassName="modal-premium-dialog"
            contentClassName="modal-premium-content"
        >
            <Modal.Header
                closeButton
                className="bg-dark border-0 pb-0"
                data-bs-theme="dark"
            >
            </Modal.Header>

            <Modal.Body className="bg-dark text-light pt-0 px-4 pb-4">
                <motion.div
                    className="d-flex flex-column align-items-center text-center"
                    initial="hidden"
                    animate={show ? "visible" : "hidden"} // Anima apenas quando o modal está visível
                    variants={containerVariants}
                >

                    {/* Ícone com Animação: escala e opacidade */}
                    <motion.div
                        className="mb-3 p-2 rounded-circle icon-container"
                        variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <img
                            src={iconMenu}
                            alt="Menu Icon"
                            className="app-icon"
                            style={{ width: '194px', height: '100px' }} // Adicionado ou ajustado
                        />
                    </motion.div>

                    <motion.h5
                        className="fw-bold mb-2 title-text"
                        style={{ color: accentColor }}
                        variants={itemVariants}
                    >
                        Recursos Exclusivos (Premium)
                    </motion.h5>

                    <motion.p
                        className="mb-3 main-text"
                        variants={itemVariants}
                    >
                        Seus dados merecem o melhor! Faça um upgrade para o <strong>Plano Pago</strong> e pare de correr riscos. Você terá:
                    </motion.p>

                    {/* Lista de Vantagens com Animação: y e opacidade */}
                    <motion.ul
                        className="text-start p-0 px-3 w-100 feature-list"
                        variants={itemVariants}
                    >
                        <li>🔒 Navegação Ilimitada</li>
                        <li>⚡️ Velocidade Máxima</li>
                        <li>🛡️ Segurança Reforçada</li>
                        <li>📊 Relatórios Avançados</li>
                    </motion.ul>

                    {/* Barra de Métricas (já usa a variante itemVariants) */}
                    <MetricBar />

                    {/* Botão de Planos (Ação Principal) com Animação: y e opacidade */}
                    <motion.div
                        className="w-100"
                        variants={itemVariants}
                    >
                        <Button
                            onClick={handleGoToPlans}
                            className="mb-3 w-100 btn-cta-main-premium"
                            style={{ backgroundColor: accentColor, borderColor: accentColor }}
                        >
                            👑 CONHECER PLANOS PAGOS
                        </Button>
                    </motion.div>

                    {/* Botão de Instalar (Ação Secundária) com Animação: y e opacidade */}
                    {canInstall && (
                        <motion.div
                            className="w-100"
                            variants={itemVariants}
                        >
                            <Button
                                variant="outline-light"
                                onClick={handleInstall}
                                className="w-100 btn-cta-secondary"
                            >
                                ⬇️ Instalar App (PWA)
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </Modal.Body>
        </Modal>
    );
};

export default MobileCtaModal;