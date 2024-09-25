import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar'; // Import NavBar
import HomePage from './components/HomePage/HomePage'; // Import HomePage
import OrderTable from './components/OrderTable/OrderTable'; // Import OrderTable
import HistoryOrder from './components/HistoryOrder/HistoryOrder'; // Import HistoryOrder

function App() {
  return (
    <Router>
      <div>
        <NavBar /> {/* Add NavBar at the top */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrderTable />} /> {/* Route for managing orders */}
          <Route path="/history" element={<HistoryOrder />} /> {/* Route for order history */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
