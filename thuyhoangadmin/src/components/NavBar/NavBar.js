import React from 'react';
import './NavBar.css'; // Import CSS for styling

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>Admin Dashboard</h1>
      </div>
      <ul className="navbar-links">
        {/* <li><a href="/">Home</a></li>
        <li><a href="/manage-users">Manage Users</a></li>
        <li><a href="/manage-products">Manage Products</a></li> */}
      </ul>
    </nav>
  );
};

export default NavBar;
