import React, { useState, useEffect } from 'react';
import './ImportProductModal.css'; // Import styles for the modal

const ImportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [importData, setImportData] = useState({
    Customer: '',
    Color: '',
    TotalAmount: '',
    ProductDetail: '',  // ProductDetail will be a string input
    totalProduct: '',
    TotalMeter: '',
    Status: 'Import'    // Set default status as 'Import'
  });

  // Handle input changes for import data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Save the import data to DynamoDB using the provided REST API
  const handleSave = async () => {
    // Convert Color and ProductDetail into ProductList format
    const productList = {};
    if (importData.Color && importData.ProductDetail) {
      productList[importData.Color] = importData.ProductDetail;
    }

    // Prepare the request body to match the DynamoDB table structure
    const requestBody = {
      Customer: importData.Customer,
      Color: importData.Color,
      TotalAmount: Number(importData.TotalAmount), // Convert to number
      ProductList: productList,  // Store ProductList as a dictionary
      TotalProduct: Number(importData.totalProduct), // Convert to number if applicable
      TotalMeter: importData.TotalMeter,
      Status: 'Import' // Hardcoded status as 'Import'
    };

    try {
      // Make a POST request to the provided API URL
      const response = await fetch('https://towbaoz4e2.execute-api.ap-southeast-2.amazonaws.com/prod/add-tranking-invent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Check if the response is successful
      if (response.ok) {
        const data = await response.json();
        console.log('Data added successfully:', data);
        onSave(importData); // Pass the data back to parent component if needed
        handleClose(); // Close the modal after successful save
      } else {
        console.error('Failed to add data. Response status:', response.status);
      }
    } catch (error) {
      console.error('Error while adding data:', error);
    }
  };

  useEffect(() => {
    // Reset the import data when modal is opened or closed
    if (!isVisible) {
      setImportData({
        Customer: '',
        Color: '',
        TotalAmount: '',
        ProductDetail: '',
        totalProduct: '',
        TotalMeter: '',
        Status: 'Import' // Reset status to 'Import'
      });
    }
  }, [isVisible]);

  return (
    isVisible && (
      <div className="import-modal">
        <div className="modal-content">
          <h3>Import Product</h3>
          {/* Input for Customer Name */}
          <input
            type="text"
            name="Customer"
            placeholder="Customer Name"
            value={importData.Customer}
            onChange={handleInputChange}
          />

          {/* Dropdown for Color selection populated with colors from parent component */}
          <select
            name="Color"
            value={importData.Color}
            onChange={handleInputChange}
          >
            <option value="">Select Color</option>
            {colors && colors.length > 0 ? (
              colors.map((color, index) => (
                <option key={index} value={color}>{color}</option>
              ))
            ) : (
              <option value="">No colors available</option>
            )}
          </select>

          {/* Input for Total Amount */}
          <input
            type="number"
            name="TotalAmount"
            placeholder="Total Amount"
            value={importData.TotalAmount}
            onChange={handleInputChange}
          />

          {/* Input for Product Detail (comma-separated string) */}
          <input
            type="text"
            name="ProductDetail"
            placeholder="Product Detail"
            value={importData.ProductDetail}
            onChange={handleInputChange}
          />

          {/* Input for Total Product */}
          <input
            type="number"
            name="totalProduct"
            placeholder="Total Product"
            value={importData.totalProduct}
            onChange={handleInputChange}
          />

          {/* Input for Total Meter */}
          <input
            type="text"
            name="TotalMeter"
            placeholder="Total Meter (e.g., '200 meters')"
            value={importData.TotalMeter}
            onChange={handleInputChange}
          />

          {/* Hidden Input for Status - Hardcoded as 'Import' */}
          <input
            type="hidden"
            name="Status"
            value={importData.Status}
          />

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
