// src/components/PasswordModal/PasswordModal.js
import React, { useState } from 'react';
import './PasswordModal.css';

const PasswordModal = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const storedPassword = process.env.REACT_APP_PASSWORD; // Read the password from the environment variable

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === storedPassword) {
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
