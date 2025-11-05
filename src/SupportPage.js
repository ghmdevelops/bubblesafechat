import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LearnMorePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import iconPage from "./components/img/icon-menu.png";

const SupportPage = () => {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleSend = () => {
        setSending(true);

        setTimeout(() => {
            setSending(false);
            setSent(true);
        }, 2500);
    };

    // Redirecionar após envio
    useEffect(() => {
        if (sent) {
            const timer = setTimeout(() => {
                navigate("/login");
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [sent, navigate]);

    return (
        <motion.div
            className="learn-more-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
        >
            <Helmet>
                <title>Bubble Safe Chat - Suporte</title>
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
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="section-title-dados text-center"
                >
                    Suporte Técnico
                </motion.h2>

                <p className="text-center mb-4">
                    Precisa de ajuda? Envie uma mensagem para nossa equipe!
                </p>

                <div className="row justify-content-center">
                    <div className="col-12 col-md-6">

                        {!sent ? (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Nome</label>
                                    <input className="form-control" placeholder="Seu nome" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">E-mail</label>
                                    <input className="form-control" placeholder="Seu email" />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mensagem</label>
                                    <textarea className="form-control" rows="4" placeholder="Descreva seu problema..." />
                                </div>

                                {!sending ? (
                                    <button
                                        className="btn btn-primary w-100"
                                        onClick={handleSend}
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} /> Enviar Email
                                    </button>
                                ) : (
                                    <>
                                        <div className="progress mt-3" style={{ height: "10px" }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated"
                                                role="progressbar"
                                                style={{ width: "100%" }}
                                            ></div>
                                        </div>
                                        <p className="text-center mt-2">Enviando...</p>
                                    </>
                                )}
                            </>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="alert alert-success text-center mt-3"
                            >
                                ✅ Email enviado com sucesso!<br />
                                Você será redirecionado...
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default SupportPage;
