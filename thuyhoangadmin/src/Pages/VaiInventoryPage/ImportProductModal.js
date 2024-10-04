// ImportProductModal.js

import React, { useState } from 'react';
import './ImportProductModal.css'; // Import styles for the modal

const ImportProductModal = ({ isVisible, handleClose, onSave }) => {
  const [importData, setImportData] = useState({
    Customer: '',
    Color: '',
    TotalAmount: '',
    ProductDetail: [],
    totalProduct: '',
    TotalMeter: ''
  });

  // Handle input changes for import data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Save the import data and close the modal
  const handleSave = () => {
    // Pass the importData back to the parent component
    onSave(importData);
    handleClose(); // Close the modal after saving
  };

  return (
    isVisible && (
      <div className="import-modal">
        <div className="modal-content">
          <h3>Import Product</h3>
          <input
            type="text"
            name="Customer"
            placeholder="Customer Name"
            value={importData.Customer}
            onChange={handleInputChange}
          />
          <select
            name="Color"
            value={importData.Color}
            onChange={handleInputChange}
          >
            <option value="">Select Color</option>
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            {/* Add more colors as per your requirements */}
          </select>
          <input
            type="number"
            name="TotalAmount"
            placeholder="Total Amount"
            value={importData.TotalAmount}
            onChange={handleInputChange}
          />
          {/* ProductDetail, totalProduct, and TotalMeter remain unchanged */}
          <div className="modal-buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  );
};

export default ImportProductModal;
