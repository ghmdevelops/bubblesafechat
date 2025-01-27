import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Retorna à página anterior
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <Helmet>
        <title>{"Bubble Safe Chat"}</title>
      </Helmet>

      <h1 className="text-danger">Página não encontrada!</h1>
      <p className="text-center">
        A página que você está procurando não existe.
      </p>
      <button
        className="btn btn-primary mt-3"
        onClick={handleGoBack}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
        }}
      >
        Voltar para a página anterior
      </button>
    </div>
  );
};

export default NotFound;
