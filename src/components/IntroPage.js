import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import "./IntroPage.css";
import iconPage from "./img/icon-menu.png";
import iconPageVisual from "./img/rm373batch4-15.jpg";
import logo from "./img/name.png";

const IntroPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      navigate("/create-room");
    }
  }, [navigate]);

  return (
    <div className="intro-container">
      <header>
        <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-black">
          <div className="container-fluid">
            <img
              className="navbar-brand img-fluid responsive-img"
              src={iconPage}
              alt="Bubble Safe Chat"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
            />
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => navigate("/login")}
                    style={{
                      padding: "5px 15px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Login
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/register")}
                    style={{
                      padding: "5px 15px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Registrar
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <div
        className="image-text-container"
        style={{ position: "relative", width: "100vw", height: "100vh" }}
      >
        <motion.div
          className="learn-more-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", height: "100%", padding: "0" }}
        >
          <img
            src={iconPageVisual}
            alt="Bubble Safe Chat"
            className="visual-image-pageifo"
          />
        </motion.div>
        <h2 className="mt-2 page-text-ifo">
          Comunicação Segura, Privacidade Garantida. Converse com tranquilidade
          em um ambiente protegido por tecnologia de criptografia avançada e
          múltiplas camadas de segurança. Controle quem acessa suas salas de
          chat, compartilhe links seguros via QR code e gerencie suas conversas
          de forma simples e eficiente. Sua privacidade é nossa prioridade
          número um.
          <br />
          <motion.button
            className="btn-learn-more"
            onClick={() => navigate("/learn-more")}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{
              scale: 1.1,
              background: "linear-gradient(90deg, #0056b3, #00aaff)",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              marginTop: "20px",
              padding: "12px 26px",
              fontSize: "1rem",
              fontWeight: "bold",
              color: "white",
              background: "linear-gradient(90deg, #007bff, #00d4ff)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            Saiba Mais
          </motion.button>
        </h2>
      </div>

      <div className="auth-buttons d-flex justify-content-center mt-4 gap-3">
        <motion.button
          className="btn btn-primary"
          onClick={() => navigate("/login")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </motion.button>
        <motion.button
          className="btn btn-secondary"
          onClick={() => navigate("/register")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: "10px 20px",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Registrar
        </motion.button>
      </div>
    </div>
  );
};

export default IntroPage;
