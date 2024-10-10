import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import CSS file for styling

const HomePage = () => {
  return (
    <div className="homepage-container">
      <h1>Chào Mừng Đến Với Trang Quản Trị</h1>
      <div className="button-container">
        <Link to="/customer" className="page-button">
          Quản Lý Khách Hàng
        </Link>
        <Link to="/product" className="page-button">
          Quản Lý Sản Phẩm
        </Link>
        <Link to="/orders" className="page-button">
          Quản Lý Đơn Hàng
        </Link>
        <Link to="/history" className="page-button">
          Lịch Sử Đơn Hàng
        </Link>
        <Link to="/inventory" className="page-button">
          Quản Lý Kho Vải
        </Link>
        <Link to="/tracking-inventory" className="page-button">
          Lịch Sử Hàng Hoá
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
