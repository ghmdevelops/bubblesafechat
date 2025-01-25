import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./PrivacyPolicy.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import iconPage from "./components/img/icon-menu.png";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="privacy-policy-container"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.7 }}
    >
      <Helmet>
        <title>Bubble Safe Chat - Política de Privacidade</title>
      </Helmet>

      <header className="privacy-policy-header">
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
        <motion.div
          className="policy-content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            className="policy-title text-info fw-bold mb-4 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Política de Privacidade
          </motion.h1>

          <motion.p
            className="policy-description text-light mt-4 mb-4"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            No <strong>Bubble Safe Chat</strong>, sua privacidade é nossa maior
            prioridade. Estamos comprometidos em proteger seus dados pessoais e
            garantir total transparência sobre como suas informações são
            coletadas, usadas e armazenadas. Nossa abordagem é guiada pelos mais
            altos padrões de segurança, em conformidade com leis globais de
            proteção de dados, como o <strong>GDPR</strong> (Regulamento Geral
            de Proteção de Dados da União Europeia) e a <strong>LGPD</strong>{" "}
            (Lei Geral de Proteção de Dados do Brasil). Valorizamos a sua
            confiança e trabalhamos continuamente para oferecer um ambiente
            digital seguro e confiável, onde sua privacidade seja respeitada em
            todos os momentos.
          </motion.p>

          {/* Seção 1: Coleta de Dados */}
          <section className="mt-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              1. Coleta de Dados
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              Coletamos uma variedade de dados pessoais e informações não
              pessoais com o intuito de melhorar a sua experiência de uso e
              garantir a segurança e o funcionamento da plataforma. Isso inclui,
              mas não se limita a:
              <ul className="mt-2">
                <li>
                  <strong>Informações Pessoais Identificáveis (PII):</strong>{" "}
                  Coletamos dados como nome, e-mail, número de telefone,
                  endereço e avatar. Esses dados são usados para autenticar sua
                  conta e personalizar sua experiência na plataforma.
                </li>
                <li>
                  <strong>Dados de Navegação:</strong> Informações sobre como
                  você acessa nosso serviço, como seu endereço IP, tipo de
                  dispositivo, localização geográfica, tipo de navegador,
                  páginas acessadas e interações dentro da plataforma.
                </li>
                <li>
                  <strong>Dados de Mensagens:</strong> O conteúdo das mensagens
                  que você envia e recebe através de nossa plataforma é
                  criptografado para garantir sua privacidade. Nenhum conteúdo é
                  acessado ou utilizado para fins comerciais sem seu
                  consentimento.
                </li>
                <li>
                  <strong>Cookies e Tecnologias de Rastreamento:</strong> Usamos
                  cookies para melhorar a funcionalidade do site, oferecer uma
                  experiência personalizada e coletar dados sobre o uso da
                  plataforma. Para mais informações sobre como usamos cookies,
                  consulte nossa{" "}
                  <Link to="/cookies-policy" className="text-info">
                    Política de Cookies
                  </Link>
                  .
                </li>
              </ul>
              A coleta de dados é feita de forma transparente e com o devido
              consentimento do usuário.
            </motion.p>
          </section>

          {/* Seção 2: Uso dos Dados */}
          <section className="mt-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              2. Uso dos Dados
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              Usamos os dados coletados para fornecer, personalizar e melhorar
              nossos serviços. Isso inclui:
              <ul className="mt-2">
                <li>
                  <strong>Autenticação e Registro de Sessão:</strong> Validamos
                  sua identidade e mantemos você conectado na plataforma durante
                  a navegação.
                </li>
                <li>
                  <strong>Personalização:</strong> Ajustamos a experiência do
                  usuário, incluindo preferências de idioma, configurações de
                  tema e recomendações.
                </li>
                <li>
                  <strong>Segurança e Monitoramento:</strong> Monitoramos o
                  tráfego da plataforma para detectar comportamentos suspeitos e
                  prevenir fraudes e ataques cibernéticos.
                </li>
                <li>
                  <strong>Suporte ao Usuário:</strong> Oferecemos suporte
                  técnico, resolvemos problemas e interagimos com você para
                  garantir a melhor experiência possível.
                </li>
              </ul>
              Todos os dados coletados são tratados de maneira responsável, e
              tomamos todas as medidas necessárias para proteger sua privacidade
              e segurança.
            </motion.p>
          </section>

          {/* Seção 3: Compartilhamento de Dados */}
          <section className="mt-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              3. Compartilhamento de Dados
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 0.9 }}
            >
              Os dados coletados podem ser compartilhados com terceiros em
              algumas situações específicas, sempre com o compromisso de
              proteger sua privacidade e segurança. Isso inclui:
              <ul className="mt-2">
                <li>
                  <strong>Exigência Legal:</strong> Se formos obrigados a
                  compartilhar dados devido a uma ordem judicial, requisitos
                  legais ou investigações governamentais.
                </li>
                <li>
                  <strong>Provedores de Serviços:</strong> Compartilhamos dados
                  com fornecedores essenciais para o funcionamento da
                  plataforma, como serviços de hospedagem, análise de dados e
                  atendimento ao cliente, sempre sob contratos de
                  confidencialidade.
                </li>
                <li>
                  <strong>Transferência Internacional de Dados:</strong> Se
                  necessário, seus dados podem ser transferidos e armazenados
                  fora do país onde você reside, em conformidade com as leis de
                  proteção de dados.
                </li>
              </ul>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com
              anunciantes ou outras empresas para fins publicitários sem o seu
              consentimento explícito.
            </motion.p>
          </section>

          {/* Seção 4: Segurança dos Dados */}
          <section className="mt-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.0 }}
            >
              4. Segurança dos Dados
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.1 }}
            >
              A segurança dos dados dos usuários é nossa principal prioridade.
              Implementamos as melhores práticas e tecnologias de segurança para
              proteger suas informações, incluindo:
              <ul className="mt-2">
                <li>
                  <strong>Criptografia de Dados:</strong> Todas as mensagens
                  enviadas pela plataforma são criptografadas ponta-a-ponta,
                  garantindo que somente o remetente e o destinatário possam ler
                  o conteúdo.
                </li>
                <li>
                  <strong>Autenticação Multifatorial:</strong> Oferecemos uma
                  camada adicional de segurança para proteger sua conta contra
                  acessos não autorizados.
                </li>
                <li>
                  <strong>Proteção Contra Ataques Cibernéticos:</strong>{" "}
                  Utilizamos firewalls, sistemas de detecção de intrusão e
                  outras tecnologias avançadas para proteger nossos servidores
                  contra ataques externos.
                </li>
              </ul>
              Embora implementemos medidas de segurança rigorosas, é importante
              notar que nenhum sistema é 100% seguro. Aconselhamos que você use
              senhas fortes e ative autenticação multifatorial sempre que
              possível.
            </motion.p>
          </section>

          {/* Seção 5: Retenção de Dados */}
          <section className="mt-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.2 }}
            >
              5. Retenção de Dados
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.3 }}
            >
              Retemos seus dados pelo tempo necessário para fornecer nossos
              serviços, atender a requisitos legais ou cumprir outras
              obrigações. Quando os dados não são mais necessários, tomamos
              medidas para excluir ou anonimizar as informações. Dados
              relacionados a mensagens autodestrutivas são removidos
              automaticamente conforme configurado pelo usuário. Se você decidir
              excluir sua conta, todos os dados serão removidos, exceto os
              registros que precisamos manter por motivos legais.
            </motion.p>
          </section>

          {/* Seção 6: Direitos dos Usuários */}
          <section className="mt-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.4 }}
            >
              6. Direitos dos Usuários
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.5 }}
            >
              Em conformidade com o <strong>GDPR</strong> e a{" "}
              <strong>LGPD</strong>, você tem os seguintes direitos sobre seus
              dados pessoais:
              <ul className="mt-2">
                <li>
                  <strong>Acesso:</strong> Você pode acessar os dados que temos
                  sobre você a qualquer momento.
                </li>
                <li>
                  <strong>Correção:</strong> Você pode corrigir dados imprecisos
                  ou incompletos.
                </li>
                <li>
                  <strong>Exclusão:</strong> Você pode solicitar a exclusão dos
                  seus dados pessoais, salvo exceções legais.
                </li>
                <li>
                  <strong>Portabilidade:</strong> Você pode solicitar a
                  transferência de seus dados para outro serviço, se aplicável.
                </li>
                <li>
                  <strong>Limitação:</strong> Você pode limitar o processamento
                  de seus dados.
                </li>
              </ul>
              Para exercer esses direitos, entre em contato com nossa equipe de
              suporte pelo e-mail:{" "}
              <a
                href="mailto:contato@bubblesafechat.com.br"
                className="text-info"
              >
                contato@bubblesafechat.com.br
              </a>
              .
            </motion.p>
          </section>

          {/* Seção 7: Alterações na Política de Privacidade */}
          <section className="mt-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.6 }}
            >
              7. Alterações na Política de Privacidade
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.7 }}
            >
              Esta política pode ser atualizada periodicamente para refletir
              mudanças nas leis ou em nossas práticas. Recomendamos que você
              revise nossa Política de Privacidade regularmente para se manter
              informado sobre como protegemos seus dados.
            </motion.p>
          </section>

          {/* Seção 8: Contato */}
          <section className="mt-5 mb-5">
            <motion.h2
              className="section-title text-info fw-bold mb-3"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.8 }}
            >
              8. Contato
            </motion.h2>
            <motion.p
              className="text-light"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.7, delay: 1.9 }}
            >
              Se você tiver dúvidas sobre esta Política de Privacidade ou como
              protegemos seus dados, entre em contato conosco pelo e-mail:{" "}
              <a
                href="mailto:contato@bubblesafechat.com.br"
                className="text-info"
              >
                contato@bubblesafechat.com.br
              </a>
              .
            </motion.p>
          </section>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default PrivacyPolicy;
