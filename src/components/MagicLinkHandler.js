// MagicLinkHandler.js
import React, { useEffect } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import Swal from "sweetalert2";

const MagicLinkHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMagicLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn");
        if (!email) {
          // Solicitar o e-mail se não estiver armazenado
          email = window.prompt(
            "Por favor, insira seu endereço de email para completar o login."
          );
        }

        try {
          const result = await signInWithEmailLink(
            auth,
            email,
            window.location.href
          );
          // Limpe o e-mail armazenado
          window.localStorage.removeItem("emailForSignIn");
          Swal.fire({
            icon: "success",
            title: "Login bem-sucedido",
            html: "Você foi logado com sucesso. Irei fechar em <b></b> milissegundos.",
            timer: 900,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              const timerElement = Swal.getPopup().querySelector("b");
              const interval = setInterval(() => {
                timerElement.textContent = Swal.getTimerLeft();
              }, 100);
              Swal.getPopup().addEventListener("close", () => {
                clearInterval(interval);
              });
            },
          }).then(() => {
            navigate("/");
          });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao completar login",
            text:
              error.message ||
              "Não foi possível completar o login. Tente novamente.",
            confirmButtonText: "Ok",
          });
          console.error("Erro ao completar login com link mágico:", error);
        }
      } else {
        // Se não for um link mágico, redireciona para a página de login
        navigate("/login");
      }
    };

    handleMagicLinkSignIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-container">
      <p>Processando login...</p>
    </div>
  );
};

export default MagicLinkHandler;
