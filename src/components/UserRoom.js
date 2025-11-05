import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const UserRoom = ({ room, onDelete }) => {
  return (
    <motion.div
      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h5 className="mb-1">{room.name}</h5>
        <small>Criada em: {new Date(room.createdAt).toLocaleString()}</small>
      </div>
      <div>
        <Link to={`/rooms/${room.id}`} className="btn btn-primary btn-sm me-2" aria-label={`Entrar na sala ${room.name}`}>
          <FontAwesomeIcon icon={faUser} className="me-1" />
          Entrar
        </Link>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(room.id)}
          aria-label={`Deletar a sala ${room.name}`}
        >
          <FontAwesomeIcon icon={faTrashAlt} className="me-1" />
          Deletar
        </button>
      </div>
    </motion.div>
  );
};

export default UserRoom;
