import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ScoreDetails from './pages/ScoreDetails';
import './index.css';

function App() {
  return (
    <>
      <div className="bg-grid"></div>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/details/:address" element={<ScoreDetails />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
