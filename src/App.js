// src/App.js

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthExample from './components/AuthExample';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';
import { auth } from './firebaseConfig';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/create-room" /> : <AuthExample />} />
        <Route path="/create-room" element={user ? <CreateRoom /> : <Navigate to="/" />} />
        <Route path="/room/:roomId" element={user ? <Room /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
