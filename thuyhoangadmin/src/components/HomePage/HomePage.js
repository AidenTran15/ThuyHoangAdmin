import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import CSS file for styling

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1>Welcome to the Admin Dashboard</h1>
      <div className="button-container">
        <Link to="/customer" className="page-button">
          Customer Management
        </Link>
        <Link to="/product" className="page-button">
          Product Management
        </Link>
        <Link to="/orders" className="page-button">
          Order Management
        </Link>
        <Link to="/history" className="page-button">
          Order History
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
