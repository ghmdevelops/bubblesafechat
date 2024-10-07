import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';
import AuthExample from './components/AuthExample';
import NotFound from './components/NotFound';
import { auth } from './firebaseConfig';

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
    <Router basename="/opensecurityroom">
      <Routes>
        {/* Rota de login */}
        <Route path="/login" element={<AuthExample />} />

        {/* Rota da página inicial para criar sala */}
        <Route 
          path="/" 
          element={user ? <CreateRoom /> : <Navigate to="/login" />} 
        />

        {/* Rota para acessar uma sala de chat */}
        <Route 
          path="/room/:roomId" 
          element={user || localStorage.getItem('hasJoined') === 'true' ? <Room /> : <Navigate to="/login" />} 
        />

        {/* Rota para páginas não encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
