import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';
import AuthExample from './components/AuthExample';
import NotFound from './components/NotFound';
import AvatarSelection from './components/AvatarSelection';
import { auth } from './firebaseConfig';
import Footer from './components/Footer';
import LearnMorePage from './LearnMorePage';
import CookiePolicy from './CookiePolicy';
import PrivacyPolicy from './PrivacyPolicy'

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
            <span className="visually-hidden">Carregando...</span>
          </div>
          <div className="mt-3">
            <span>Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthExample />} />
        <Route path="/" element={user ? <CreateRoom /> : <Navigate to="/login" />} />
        <Route path="/learn-more" element={<LearnMorePage />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/avatar-selection" element={user ? <AvatarSelection /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
