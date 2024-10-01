// src/components/PasswordModal/PasswordModal.js
import React, { useState } from 'react';
import './PasswordModal.css';

const PasswordModal = ({ onPasswordCorrect }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const storedPassword = process.env.REACT_APP_PASSWORD; // Đọc mật khẩu từ biến môi trường

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === storedPassword) {
      onPasswordCorrect();
    } else {
      setError('Sai mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <h2>Vui Lòng Nhập Mật Khẩu</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Nhập mật khẩu"
          />
          <button type="submit">Xác Nhận</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default PasswordModal;
