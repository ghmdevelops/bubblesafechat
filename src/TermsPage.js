import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LearnMorePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faShieldAlt,
    faUserShield,
    faLock,
    faFileContract,
    faUserSecret,
    faServer,
} from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import iconPage from "./components/img/icon-menu.png";
import iconPageVisual from "./components/img/StockCake-Cybersecurity.jpg";

const TermsPage = () => {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="learn-more-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            <Helmet>
                <title>Bubble Safe Chat - Termos de Uso</title>
            </Helmet>

            <header>
                <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
                    <div className="container-fluid">
                        <Link to="/login">
                            <img
                                className="navbar-brand img-fluid responsive-img"
                                src={iconPage}
                                alt="Bubble Safe Chat"
                            />
                        </Link>
                    </div>
                </nav>
            </header>
            
            <main className="container mt-5 pt-5 pb-5">
                <div className="row justify-content-center align-items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        transition={{ duration: 0.5 }}
                        className="col-12 col-md-8 d-flex justify-content-center"
                    >
                        <img
                            src={iconPageVisual}
                            alt="Bubble Safe Chat Terms"
                            className="img-fluid rounded shadow"
                            style={{ maxHeight: "260px", objectFit: "cover" }}
                        />
                    </motion.div>
                </div>

                <motion.h2
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="section-title-dados text-center mt-4"
                    style={{ fontSize: "1.8rem" }}
                >
                    Termos de Uso
                </motion.h2>

                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.6 }}
                    className="page-description text-center mb-4 mx-auto"
                    style={{ maxWidth: "700px" }}
                >
                    Estes Termos regulam o uso da plataforma <strong>Bubble Safe Chat</strong>.
                    Ao utilizar nossos serviços, você concorda com todas as regras abaixo.
                </motion.p>

                {/* CARDS */}
                <div className="row justify-content-center g-4 mt-4">
                    {[
                        { icon: faFileContract, title: "Aceitação dos Termos", desc: "Concordância automática com diretrizes internas e políticas." },
                        { icon: faShieldAlt, title: "Privacidade e Segurança", desc: "Criptografia ponta a ponta e camadas de proteção." },
                        { icon: faUserShield, title: "Responsabilidade do Usuário", desc: "Proibido conteúdos ilegais, ofensivos ou sensíveis." },
                        { icon: faServer, title: "Armazenamento Temporário", desc: "Mensagens podem ser destruídas automaticamente." },
                        { icon: faLock, title: "Propriedade Intelectual", desc: "Proibido copiar, revender ou modificar sem permissão." },
                        { icon: faUserSecret, title: "Anonimato", desc: "Permitido, mas fraudes resultam em banimento." },
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                            className="col-12 col-sm-6 col-lg-4"
                        >
                            <div className="p-3 text-center rounded shadow h-100 card-feature">
                                <FontAwesomeIcon icon={item.icon} className="mb-3 display-6" />
                                <h5>{item.title}</h5>
                                <p className="small">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.h2
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="section-title-dados text-center mt-5"
                    style={{ fontSize: "1.6rem" }}
                >
                    Alterações nos Termos
                </motion.h2>

                <motion.p
                    initial="hidden"
                    animate="visible"
                    variants={fadeInUp}
                    transition={{ duration: 1 }}
                    className="page-description text-center mx-auto"
                    style={{ maxWidth: "700px" }}
                >
                    Podemos atualizar estes Termos a qualquer momento. Continuar usando
                    a plataforma significa que você concorda com as mudanças.
                </motion.p>
            </main>
        </motion.div>
    );
};

export default TermsPage;
