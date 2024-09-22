import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage/HomePage'; // Import your HomePage component
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
