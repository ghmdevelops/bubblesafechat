import React from "react";
import { motion } from "framer-motion";
import "./ServiceModal.css";
import iconPage from "./img/icon-page-200.png";

const ServiceModal = ({ onClose, onViewPlans }) => {
    return (
        <div className="modal-overlay">
            <motion.div
                className="modal-container"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
            >

                {/* Ícone */}
                <motion.img
                    src={iconPage}
                    alt="Bubble Safe Logo"
                    className="modal-logo"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 }}
                />

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    Serviços Profissionais
                </motion.h2>

                <motion.p
                    className="modal-description"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.22 }}
                >
                    Expanda suas capacidades com salas privadas, auditoria inteligente,
                    armazenamento dedicado, monitoramento de segurança e integração via API.
                </motion.p>

                <div className="modal-badges">
                    <span>🔐 Criptografia Avançada</span>
                    <span>📑 Logs Inteligentes</span>
                    <span>📡 API Empresarial</span>
                    <span>🛡 Auditoria Forense</span>
                </div>

                <div className="modal-actions">
                    <motion.button
                        className="btn primary"
                        onClick={onViewPlans}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.94 }}
                    >
                        Ver Planos
                    </motion.button>

                    <motion.button
                        className="btn secondary"
                        onClick={onClose}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        Fechar
                    </motion.button>
                </div>

                <p className="support-text">
                    Dúvidas? Nossa equipe está pronta para ajudar.
                </p>

            </motion.div>
        </div>
    );
};

export default ServiceModal;
