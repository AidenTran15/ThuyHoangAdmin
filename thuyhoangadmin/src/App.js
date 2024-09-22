import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar'; // Import NavBar
import HomePage from './components/HomePage/HomePage'; // Example page



function App() {
  return (
    <Router>
      <div>
        <NavBar /> {/* Add NavBar at the top */}
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
