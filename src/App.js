import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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
import TermsPage from "./TermsPage";
import IntroPage from "./components/IntroPage";
import SupportPage from "./SupportPage";
import Footer from "./components/Footer";
import { auth } from "./firebaseConfig";
import PlansPage from "./components/PlansPage";

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (loading) {
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
      <ScrollToTopOnRouteChange />

      <Routes>

        <Route path="/" element={isMobile ? <Navigate to="/create-room" /> : <IntroPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/magic-link" element={<MagicLinkHandler />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/planos" element={<PlansPage />} />

        <Route
          path="/create-room"
          element={user ? <CreateRoom /> : <Navigate to="/login" />}
        />

        <Route
          path="/user-profile"
          element={user ? <UserProfile /> : <Navigate to="/login" />}
        />

        <Route
          path="/door/:roomId"
          element={user ? <DoorPage /> : <Navigate to="/login" />}
        />

        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/support" element={<SupportPage />} />

        <Route path="/room/:roomId" element={<Room />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isMobile && <Footer />}
    </Router>
  );
}

export default App;
