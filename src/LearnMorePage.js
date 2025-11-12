import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LearnMorePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUser,
  faLock,
  faShieldAlt,
  faCommentDots,
  faQrcode,
} from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import iconPage from "./components/img/icon-menu.png";
import iconPageVisual from "./components/img/icon-page.png";

const LearnMorePage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

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
        <title>Bubble Safe Chat - Saiba Mais</title>
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

      <main className="container mt-5 pt-5">
        <div className="row justify-content-center align-items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
            className="content-right col-12 col-md-6 d-flex justify-content-center align-items-center"
          >
            <img
              src={iconPageVisual}
              alt="Bubble Safe Chat"
              className="visual-image img-fluid"
            />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.7, ease: "easeInOut", delay: 0.3 }}
          className="page-description mt-3 mb-3 text-center"
        >
          <strong>Bubble Safe Chat</strong> é a sua solução definitiva para
          comunicação online segura e privada. Nossa plataforma foi projetada
          para proteger seus dados em cada etapa, oferecendo segurança de nível
          mundial e funcionalidades avançadas para manter suas conversas e
          informações pessoais sob total controle.
        </motion.p>

        <motion.h2
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="section-title-dados text-center mt-5"
        >
          🚫 Por que Não Temos um Aplicativo (App) para Instalar?
        </motion.h2>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="page-description mt-3 mb-5 text-center"
        >
          Conheça a <strong>Arquitetura do Futuro</strong>: O <strong>Bubble Safe Chat</strong>, um <strong>Progressive Web App (PWA)</strong>, foi estrategicamente desenhado para <strong>MAXIMIZAR sua segurança e privacidade</strong>. É a escolha inteligente, comprovadamente mais forte que os apps nativos!
        </motion.p>

        <div className="row features-container justify-content-center mt-4 mb-5">
          {/* Card 1: Maior Privacidade */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faShieldAlt} className="feature-icon mb-3" />
            <h3>Máxima Privacidade (Sem Permissões Invasivas)</h3>
            <p>
              Ao usar o navegador, **evitamos as permissões invasivas** que muitos apps nativos solicitam (como acesso à sua lista de contatos ou localização em segundo plano). Sua interação é mais isolada e segura.
            </p>
          </motion.div>

          {/* Card 2: Leve e Sem Instalação Obrigatória */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faQrcode} className="feature-icon mb-3" />
            <h3>Leveza e Sem Bloqueio de Armazenamento</h3>
            <p>
              Funciona como um atalho do navegador (PWA), **economizando o valioso espaço de armazenamento** que um aplicativo tradicional consumiria. Você tem a experiência de um app sem o peso de um.
            </p>
          </motion.div>

          {/* Card 3: Atualização e Segurança Garantida */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faLock} className="feature-icon mb-3" />
            <h3>Atualizações Imediatas de Segurança</h3>
            <p>
              As PWAs se atualizam automaticamente sempre que você acessa a plataforma, eliminando a necessidade de visitar lojas de apps e garantindo que você esteja **sempre utilizando a versão mais segura**.
            </p>
          </motion.div>
        </div>

        <motion.h2
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="section-title-dados text-center mt-5"
        >
          O que o Bubble Safe Chat oferece?
        </motion.h2>

        <div className="row features-container mt-4">
          {/* Primeira Linha de Features */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faLock} className="feature-icon mb-3" />
            <h3>Criptografia Avançada</h3>
            <p>
              Todas as conversas são protegidas por criptografia de ponta a
              ponta, garantindo que somente você e o destinatário possam acessar
              o conteúdo.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faShieldAlt} className="feature-icon mb-3" />
            <h3>Mensagens Protegidas com Senha</h3>
            <p>
              Adicione uma camada extra de segurança às suas mensagens,
              configurando senhas personalizadas.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon
              icon={faCommentDots}
              className="feature-icon mb-3"
            />
            <h3>Controle Total</h3>
            <p>
              Você tem controle completo sobre suas salas de chat, definindo
              quem pode entrar e quanto tempo as mensagens permanecerão.
            </p>
          </motion.div>

          {/* Segunda Linha de Features */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faQrcode} className="feature-icon mb-3" />
            <h3>Compartilhamento via QR Code</h3>
            <p>
              Crie salas de chat rapidamente e compartilhe o acesso por meio de
              QR codes.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faUser} className="feature-icon mb-3" />
            <h3>Anonimato Garantido</h3>
            <p>
              Participe de conversas sem revelar sua identidade. Privacidade
              total nas suas interações.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faLock} className="feature-icon mb-3" />
            <h3>Autodestruição de Mensagens</h3>
            <p>
              Configura mensagens para autodestruição após visualização ou após
              um período definido.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faShieldAlt} className="feature-icon mb-3" />
            <h3>Segurança em Camadas</h3>
            <p>
              Utilizamos múltiplas camadas de segurança para proteger suas
              conversas e dados.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon
              icon={faCommentDots}
              className="feature-icon mb-3"
            />
            <h3>Fale e Escreva</h3>
            <p>
              Use o reconhecimento de voz para transcrever suas mensagens
              rapidamente.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon
              icon={faCommentDots}
              className="feature-icon mb-3"
            />
            <h3>Interação em Tempo Real</h3>
            <p>
              Converse instantaneamente com amigos e familiares, sem atrasos.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon
              icon={faCommentDots}
              className="feature-icon mb-3"
            />
            <h3>Mensagens de Voz</h3>
            <p>
              Envie mensagens de voz rápidas e fáceis, mantendo a comunicação
              fluida.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.7 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faLock} className="feature-icon mb-3" />
            <h3>Verificação de Segurança</h3>
            <p>
              Realize verificações de segurança regulares para manter sua conta
              segura.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.5, delay: 1.8 }}
            className="feature-card col-12 col-md-6 col-lg-4 mb-4 d-flex flex-column align-items-center text-center p-3"
          >
            <FontAwesomeIcon icon={faQrcode} className="feature-icon mb-3" />
            <h3>Facilidade de Uso</h3>
            <p>
              Interface intuitiva que facilita a navegação e o uso da
              plataforma.
            </p>
          </motion.div>
        </div>

        <motion.h2
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="section-title-dados text-center mt-5"
        >
          Por que escolher o Bubble Safe Chat?
        </motion.h2>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="page-description text-center"
        >
          O <strong>Bubble Safe Chat</strong> é a melhor escolha para quem busca
          uma comunicação online privada, segura e eficiente. Nossa plataforma é
          fácil de usar, com funcionalidades avançadas para manter suas
          conversas protegidas. Além disso, oferecemos suporte contínuo e
          garantimos um tempo de atividade de 99,9%, assegurando que suas
          conversas nunca sejam interrompidas. Seja para uso pessoal ou
          profissional, o Bubble Safe Chat oferece as ferramentas que você
          precisa para manter suas informações seguras e privadas.
        </motion.p>
      </main>
    </motion.div>
  );
};

export default LearnMorePage;
