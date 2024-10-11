import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';
import AuthExample from './components/AuthExample';
import NotFound from './components/NotFound';
import { auth } from './firebaseConfig';
import Footer from './components/Footer';

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
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthExample />} />
        <Route path="/" element={user ? <CreateRoom /> : <Navigate to="/login" />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
