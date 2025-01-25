import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";

const NotFound = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/login");
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
    </div>
  );
};

export default NotFound;
