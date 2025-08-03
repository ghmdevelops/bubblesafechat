import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFacebookF,
    faTwitter,
    faGoogle,
    faInstagram,
    faLinkedinIn,
    faGithub,
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import "./Footer.css";
import iconPage from "./img/icon-page.png";
import Swal from "sweetalert2";

const socialLinks = [
    { icon: faFacebookF, label: "Facebook", href: "#" },
    { icon: faTwitter, label: "Twitter", href: "#" },
    { icon: faGoogle, label: "Google", href: "#" },
    { icon: faInstagram, label: "Instagram", href: "#" },
    { icon: faLinkedinIn, label: "LinkedIn", href: "#" },
    { icon: faGithub, label: "GitHub", href: "#" },
];

const Footer = () => {
    const navigate = useNavigate();
    const [newsletterEmail, setNewsletterEmail] = useState("");

    const handlePrivacyPolicyClick = () => {
        navigate("/politica-de-privacidade");
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!newsletterEmail || !newsletterEmail.includes("@")) {
            Swal.fire({
                icon: "error",
                title: "Email inválido",
                text: "Por favor, insira um email válido para assinar.",
                toast: true,
                position: "top-end",
                timer: 2000,
                showConfirmButton: false,
            });
            return;
        }
        // Placeholder: integrar com backend/serviço real
        Swal.fire({
            icon: "success",
            title: "Inscrito!",
            text: "Você será notificado com novidades.",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
        });
        setNewsletterEmail("");
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-inner container">
                <div className="brand-section">
                    <div className="logo-row">
                        <img src={iconPage} alt="Bubble Safe Chat logo" className="logo-4903" />
                        <div>
                            <h6 className="brand-title">Bubble Safe Chat</h6>
                            <p className="tagline">Converse com segurança, controle com liberdade!</p>
                        </div>
                    </div>
                    <p className="description">
                        Estamos revolucionando a forma de se comunicar com soluções de chat
                        ultrasseguras. Nossa missão é clara: colocar a inovação e a segurança
                        no coração de cada interação, protegendo suas conversas e garantindo
                        total privacidade.
                    </p>
                    <address className="contact-block">
                        <div className="contact-item">
                            <FontAwesomeIcon icon={faEnvelope} />{" "}
                            <a href="mailto:contato@bubblesafechat.com.br" className="contact-link">
                                contato@bubblesafechat.com.br
                            </a>
                        </div>
                        <div
                            className="privacy-link"
                            onClick={handlePrivacyPolicyClick}
                            role="button"
                            tabIndex={0}
                            aria-label="Ver política de privacidade"
                        >
                            Política de Privacidade
                        </div>
                    </address>
                </div>

                <div className="links-newsletter">
                    <div className="link-section">
                        <h6>Recursos</h6>
                        <ul>
                            <li>
                                <button className="link-btn" onClick={() => navigate("/learn-more")}>
                                    Saiba Mais
                                </button>
                            </li>
                            <li>
                                <button className="link-btn" onClick={() => navigate("/create-room")}>
                                    Criar Sala
                                </button>
                            </li>
                            <li>
                                <button className="link-btn" onClick={() => navigate("/support")}>
                                    Suporte
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="link-section">
                        <h6>Empresa</h6>
                        <ul>
                            <li>
                                <button className="link-btn" onClick={() => navigate("/about")}>
                                    Sobre Nós
                                </button>
                            </li>
                            <li>
                                <button className="link-btn" onClick={() => navigate("/terms")}>
                                    Termos
                                </button>
                            </li>
                            <li>
                                <button className="link-btn" onClick={() => navigate("/privacy")}>
                                    Privacidade
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="newsletter-section">
                        <h6>Receba novidades</h6>
                        <p className="small">
                            Assine nossa newsletter para atualizações e dicas de segurança.
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                            <input
                                aria-label="Email para newsletter"
                                type="email"
                                placeholder="Seu email"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                            />
                            <button type="submit" className="btn-subscribe">
                                Inscrever
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="bottom-bar">
                <div className="social-wrapper">
                    {socialLinks.map((s) => (
                        <a
                            key={s.label}
                            href={s.href}
                            aria-label={s.label}
                            className="social-icon"
                            rel="noopener noreferrer"
                        >
                            <FontAwesomeIcon icon={s.icon} />
                        </a>
                    ))}
                </div>
                <div className="rights">
                    <span>© {currentYear} Bubble Safe Chat. Todos os direitos reservados.</span>
                    <button
                        className="back-to-top"
                        onClick={scrollToTop}
                        aria-label="Voltar ao topo"
                    >
                        ↑ Topo
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
