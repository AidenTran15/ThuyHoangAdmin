import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import { FaUsers, FaBox, FaShoppingCart, FaHistory } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Welcome to the Admin Dashboard</h1>
      <p className="homepage-description">Manage your customers, products, orders, and history with ease.</p>
      <div className="card-container">
        <Link to="/customer" className="card">
          <FaUsers className="card-icon" />
          <h2 className="card-title">Customer Management</h2>
          <p className="card-description">Manage your customers' data efficiently.</p>
        </Link>
        <Link to="/product" className="card">
          <FaBox className="card-icon" />
          <h2 className="card-title">Product Management</h2>
          <p className="card-description">Add, edit, and remove products seamlessly.</p>
        </Link>
        <Link to="/orders" className="card">
          <FaShoppingCart className="card-icon" />
          <h2 className="card-title">Order Management</h2>
          <p className="card-description">Track and manage your orders in real-time.</p>
        </Link>
        <Link to="/history" className="card">
          <FaHistory className="card-icon" />
          <h2 className="card-title">Order History</h2>
          <p className="card-description">View past orders and transaction details.</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
