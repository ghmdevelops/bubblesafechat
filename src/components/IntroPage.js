import { MdOutlineAttachMoney } from "react-icons/md";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaUserShield, FaLock, FaClock, FaUserSecret } from "react-icons/fa";
import { RiLoginBoxFill } from "react-icons/ri";
import { FiSun, FiMoon } from "react-icons/fi";
import { auth } from "../firebaseConfig";
import { useTheme } from "./hooks/useTheme";
import "./IntroPage.css";
import iconPage from "./img/icon-menu.png";
import heroBg from "./img/rm373batch4-15.jpg";
import ServiceModal from "./ServiceModal";

const securityFeatures = [
  {
    icon: <FaLock />,
    title: "Criptografia AES-256",
    desc: "Todas as conversas são protegidas ponta a ponta.",
  },
  {
    icon: <FaUserShield />,
    title: "Links Expiráveis",
    desc: "Compartilhe com controle total de tempo e acesso.",
  },
  {
    icon: <FaClock />,
    title: "Auditoria & Logs",
    desc: "Rastreie acessos e atividades com histórico imutável.",
  },
  {
    icon: <FaLock />,
    title: "2FA Opcional",
    desc: "Camada extra de proteção no login do usuário.",
  },
];

const metrics = [
  { value: "12k+", label: "Salas Criadas" },
  { value: "99.98%", label: "Uptime Garantido" },
  { value: "4+", label: "Camadas de Criptografia" },
  { value: "5m", label: "Links Expiram em" },
];

const FeatureCard = ({ icon, title, desc, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      className="feature-card"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      <div className="icon" aria-hidden="true">
        {icon}
      </div>
      <div className="info">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </motion.div>
  );
};

const IntroPage = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const [showServiceModal, setShowServiceModal] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/create-room");
    });
    return unsubscribe;
  }, [navigate]);

  if (showServiceModal) {
    return (
      <ServiceModal
        onClose={() => setShowServiceModal(false)}
        onViewPlans={() => navigate("/planos")}
      />
    );
  }

  const handleViewPlans = () => {
    navigate("/planos");
  };

  return (
    <div className="intro-page">
      <Helmet>
        <title>Bubble Safe Chat – Segurança Total</title>
      </Helmet>

      <header className="site-header">
        <div className="nav-inner container">
          <div className="brand">
            <Link to="/" aria-label="Home">
              <img src={iconPage} alt="Bubble Safe Chat" className="logo" />
            </Link>
          </div>
          <div className="actions">
            <button
              className="hamburger"
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>
          </div>
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <button
              className="btn outline"
              onClick={() => {
                navigate("/login");
                setMenuOpen(false);
              }}
              aria-label="Login"
            >
              <RiLoginBoxFill size={16} />
              <span className="label">Login</span>
            </button>
            <button
              className="btn outline"
              onClick={() => {
                navigate("/register");
                setMenuOpen(false);
              }}
              aria-label="Registrar"
            >
              <FaUserSecret size={16} />
              <span className="label">Registrar</span>
            </button>
          </nav>
          {menuOpen && (
            <div
              className="backdrop"
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
            />
          )}
        </div>
      </header>

      <section className="hero">
        <motion.div
          className="hero-bg"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          aria-hidden="true"
        >
          <img
            src={heroBg}
            alt="Fundo seguro e tecnológico"
            loading="lazy"
            className={`hero-img ${heroLoaded ? "loaded" : ""}`}
            onLoad={() => setHeroLoaded(true)}
          />
        </motion.div>
        <div className="overlay" aria-hidden="true" />
        <div className="hero-content container">
          <div className="text-block">
            <motion.h1
              className="title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Comunicação Segura Privacidade Inabalável.
            </motion.h1>
            <motion.p
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Converse com tranquilidade em ambiente protegido por múltiplas
              camadas de criptografia, controle de acessos e links temporários
              via QR code. Sua privacidade é nossa prioridade número um.
            </motion.p>
            <motion.div
              className="cta-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                className="btn primary"
                onClick={() => navigate("/learn-more")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Saiba mais"
              >
                Saiba Mais
              </motion.button>
              <motion.button
                className="btn secondary"
                onClick={() => navigate("/create-room")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Criar sala"
              >
                Criar Sala
              </motion.button>
            </motion.div>
            <motion.button
              className="btn primary mt-3"
              onClick={handleViewPlans}
              style={{
                padding: "clamp(10px, 2.5vw, 16px) clamp(36px, 8vw, 77px)",
                fontSize: "clamp(0.7rem, 1.8vw, 0.95rem)",
                background: "#27b082ff",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
            >
              <MdOutlineAttachMoney size={22} /> Ver Planos
            </motion.button>

          </div>
          <div className="stats-cards">
            {metrics.map((m, i) => (
              <motion.div
                className="metric"
                key={m.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                <div className="value">{m.value}</div>
                <div className="label">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="features container">
        <h2 className="section-title">O que torna seguro</h2>
        <div className="feature-grid">
          {securityFeatures.map((f, idx) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              desc={f.desc}
              delay={idx * 0.15}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default IntroPage;
