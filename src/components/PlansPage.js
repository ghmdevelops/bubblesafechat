// src/components/PlansPage.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./PlansPage.css";
import iconPage from "./img/icon-menu.png";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

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

  const openContactAlert = () => {
    Swal.fire({
      title: "Entre em contato",
      html: `
        Nosso time comercial responderá rapidamente.<br><br>
        <strong>📩 contato@bubblesafechat.com.br</strong>
      `,
      icon: "info",
      confirmButtonText: "Copiar e-mail",
    }).then((result) => {
      if (result.isConfirmed) {
        navigator.clipboard.writeText("contato@bubblesafechat.com");
        Swal.fire(
          "Copiado!",
          "E-mail copiado para a área de transferência.",
          "success"
        );
      }
    });
  };

  // Estado para hora atual
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lógica de vendas automáticas
  const startDate = new Date("2025-01-01"); // data inicial das 100 vendas
  const baseSales = 100; // vendas iniciais
  const incrementEveryDays = 5; // a cada 5 dias, adiciona 1 venda

  const [totalSales, setTotalSales] = useState(baseSales);

  useEffect(() => {
    const updateSales = () => {
      const now = new Date();
      const diffTime = now - startDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const additionalSales = Math.floor(diffDays / incrementEveryDays);
      setTotalSales(baseSales + additionalSales);
    };

    updateSales(); // atualização inicial
    const interval = setInterval(updateSales, 60 * 1000); // atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

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

        {/* Planos 
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
                onClick={openContactAlert}
              >
                Assinar agora
              </motion.button>
            </motion.div>
          ))}
        </div>
*/}
        {/* API Section */}
        <div className="api-card mt-4 p-4 shadow rounded">
          <div className="ribbon">Add-on Corporativo</div>

          <h3>Consumo de API</h3>
          <p className="api-desc">
            Integre salas seguras, auditoria, logs e permissões diretamente no seu ecossistema.
            Retenção, chaves individuais e políticas sob demanda.
          </p>

          <div className="api-prices d-flex gap-4 flex-wrap mt-3">
            <div className="price-item">
              <span className="value">R$ 0,09</span>
              <span className="label">por requisição</span>
            </div>

            <div className="price-item">
              <span className="value">R$ 1.900</span>
              <span className="label">pacote 50k</span>
            </div>

            <div className="price-item">
              <span className="value">Sob Consulta</span>
              <span className="label">planos enterprise</span>
            </div>

            <div className="price-item">
              <span className="value">+ Suporte 24/7</span>
              <span className="label">Chat e E-mail</span>
            </div>

            <div className="price-item">
              <span className="value">+ SLA Garantido</span>
              <span className="label">99,9% uptime</span>
            </div>
          </div>

          <button className="btn-talk mt-3" onClick={openContactAlert}>
            Falar com vendas
          </button>

          <div className="sales-section mt-4">
            <h5>Mais de {totalSales} vendas realizadas</h5>
            <p>Última atualização: {currentTime.toLocaleString()}</p>
          </div>
        </div>

        {/* Pagamento */}
        <div className="payment-brands mb-4 mt-4">
          <span>💳 Cartão - </span>
          <span>⚡ PIX - </span>
          <span>🔐 Stripe - </span>
          <span>₿ Bitcoin - </span>
          <span>♦️ Ethereum</span>
        </div>
      </div>
    </>
  );
};

export default PlansPage;
