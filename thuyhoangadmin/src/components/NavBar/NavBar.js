// src/components/NavBar/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './NavBar.css'; // Import CSS for styling

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>Thuỷ Hoàng</h1>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Trang Chủ</Link></li>
        <li><Link to="/orders">Đơn Hàng</Link></li>
        <li><Link to="/history">Lịch Sử</Link></li>
        <li><Link to="/customer">Khách Hàng</Link></li>
        <li><Link to="/product">Sản Phẩm</Link></li>
        <li><Link to="/inventory">Inventory</Link></li> {/* New link for inventory */}
      </ul>
    </nav>
  );
};

export default NavBar;
