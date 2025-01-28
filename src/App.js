import React, { useEffect, useState } from "react";
import {
  HashRouter as Router,
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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); 
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
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/magic-link" element={<MagicLinkHandler />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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

        <Route
          path="/room/:roomId"
          element={<Room />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
