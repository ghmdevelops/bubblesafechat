// src/components/PlansPage.js
import React from "react";
import { motion } from "framer-motion";
import "./PlansPage.css";
import iconPage from "./img/icon-menu.png";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const PlansPage = () => {
  const plans = [
    {
      name: "Básico",
      price: "R$ 29",
      period: "/mês",
      features: [
        "Salas seguras",
        "Links expiráveis",
        "Histórico limitado",
        "Suporte padrão",
      ],
      highlight: false,
    },
    {
      name: "Profissional",
      price: "R$ 59",
      period: "/mês",
      features: [
        "Até 50 salas",
        "Auditoria avançada",
        "Criptografia reforçada",
        "Suporte prioritário",
        "Logs exportáveis",
      ],
      highlight: true,
      badge: "Mais Popular",
    },
    {
      name: "Empresarial",
      price: "R$ 199",
      period: "/mês",
      features: [
        "Salas ilimitadas",
        "Equipe dedicada",
        "Logs avançados",
        "Integrações customizadas",
        "Contrato corporativo",
        "Retenção configurável",
      ],
      highlight: false,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Bubble Safe Chat - Assinatura</title>
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

      <div className="plans-container mt-5">

        <motion.h1
          className="title premium-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          ░ Planos & Assinaturas
        </motion.h1>

        <motion.p
          className="subtitle premium-subtitle mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Segurança corporativa, auditoria inteligente e privacidade avançada.
        </motion.p>

        <div className="plans-grid mt-5">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`plan-card ${plan.highlight ? "highlight" : ""}`}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.05, translateY: -8 }}
            >
              {plan.badge && <span className="badge">{plan.badge}</span>}
              <h2>{plan.name}</h2>

              <p className="price">
                {plan.price}
                <span>{plan.period}</span>
              </p>

              <ul>
                {plan.features.map((f) => (
                  <li key={f}>✅ {f}</li>
                ))}
              </ul>

              <motion.button
                className="btn-plan"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                Assinar agora
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* API Section */}
        <div className="api-section">
          <h3>Consumo de API (Add-on Corporativo)</h3>
          <p>
            Integre salas seguras, auditoria, logs e permissões diretamente no seu sistema.
            Retenção configurável, chaves por usuário e políticas sob demanda.
          </p>

          <div className="api-options">
            <div>R$ 0,09 / requisição</div>
            <div>R$ 1900 / 50k requisições</div>
            <div>Planos personalizados</div>
          </div>

          <button className="btn-talk">Falar com vendas</button>
        </div>

        <div className="payment-brands">
          <span>💳 Cartão</span>
          <span>⚡ PIX</span>
          <span>🔐 Stripe</span>
        </div>
      </div>
    </>
  );
};

export default PlansPage;
