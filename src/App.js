// src/App.js
import React, { useEffect, useState } from "react";
import {
  HashRouter as Router, // Use HashRouter se estiver utilizando URLs com #
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";
import DoorPage from './components/DoorPage';
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import MagicLinkHandler from "./components/MagicLinkHandler";
import UserProfile from "./components/UserProfile";
import NotFound from "./components/NotFound";
import LearnMorePage from "./LearnMorePage";
import CookiePolicy from "./CookiePolicy";
import PrivacyPolicy from "./PrivacyPolicy";
import IntroPage from "./components/IntroPage";
import Footer from "./components/Footer";
import { auth } from "./firebaseConfig";


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observa o estado de autenticação do Firebase
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Limpa a inscrição quando o componente é desmontado
  }, []);

  if (loading) {
    // Exibe um indicador de carregamento enquanto verifica o estado do usuário
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden"></span>
          </div>
          <div className="mt-3">
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rota para IntroPage */}
        <Route path="/" element={<IntroPage />} />

        {/* Rota para Login */}
        <Route path="/login" element={<Login />} />

        <Route path="/magic-link" element={<MagicLinkHandler />} />

        {/* Rota para Registro */}
        <Route path="/register" element={<Register />} />

        {/* Rota para Reset de Senha */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rota para a Página Principal (Criar Sala) */}
        <Route
          path="/create-room"
          element={user ? <CreateRoom /> : <Navigate to="/login" />}
        />

        {/* Rota para Perfil do Usuário */}
        <Route
          path="/user-profile"
          element={user ? <UserProfile /> : <Navigate to="/login" />}
        />

        <Route
          path="/door/:roomId"
          element={user ? <DoorPage /> : <Navigate to="/login" />}
        />

        {/* Outras Rotas Públicas */}
        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />

        {/* Rota para Sala de Chat (Agora Pública) */}
        <Route
          path="/room/:roomId"
          element={<Room />}
        />

        {/* Rota para Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
