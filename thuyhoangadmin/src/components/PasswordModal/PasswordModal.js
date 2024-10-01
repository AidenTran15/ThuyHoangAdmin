// src/components/PasswordModal/PasswordModal.js
import React, { useState } from 'react';
import './PasswordModal.css'; // Create a CSS file for styling if needed

const PasswordModal = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError(''); // Reset error on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '123') {
      onPasswordCorrect();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2>Please Enter Password</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter password"
          />
          <button type="submit">Submit</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default PasswordModal;
