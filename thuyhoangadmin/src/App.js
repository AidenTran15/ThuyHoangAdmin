import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import HomePage from './components/HomePage/HomePage';
import OrderTable from './components/OrderTable/OrderTable';
import HistoryOrder from './components/HistoryOrder/HistoryOrder';
import CustomerPage from './Pages/CustomerPage/CustomerPage';
import ProductPage from './Pages/ProductPage/ProductPage';
import PasswordModal from './components/PasswordModal/PasswordModal'; // Import PasswordModal
import VaiInventoryTable from './Pages/VaiInventoryPage/VaiInventoryPage';
import InventoryPage from './Pages/InventoryPage/InventoryPage'; // Import the new InventoryPage component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordCorrect = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div>
        {!isAuthenticated && <PasswordModal onPasswordCorrect={handlePasswordCorrect} />}
        {isAuthenticated && (
          <>
            <NavBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<OrderTable />} />
              <Route path="/history" element={<HistoryOrder />} />
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/product" element={<ProductPage />} />
              <Route path="/inventory" element={<VaiInventoryTable />} />
              <Route path="/tracking-inventory" element={<InventoryPage />} /> {/* New route for inventory tracking page */}
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
