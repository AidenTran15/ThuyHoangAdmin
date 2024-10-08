import React, { useState, useEffect } from 'react';
import './ImportProductModal.css'; // Import styles for the modal

const ImportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [importData, setImportData] = useState({
    Customer: '',
    TotalAmount: '',
    ProductDetail: '',  // Temporary field for product details as string
    Color: '',          // Temporary field for selected color
    ProductList: {},    // Dictionary to store color as key and product details as value (list of numbers)
    totalProduct: 0,    // Total count of all products across colors
    TotalMeter: 0,      // Total sum of all product meters
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

  // Calculate total product count and total meters based on ProductList
  const calculateTotals = (productList) => {
    let totalProduct = 0;
    let totalMeter = 0;

    for (const color in productList) {
      const productValues = productList[color];
      const numericValues = productValues.filter(value => !isNaN(value) && value > 0);
      totalProduct += numericValues.length;
      totalMeter += numericValues.reduce((acc, value) => acc + value, 0);
    }

    return { totalProduct, totalMeter };
  };

  // Calculate total product and meters for a specific color
  const calculateColorTotals = (productValues) => {
    const numericValues = productValues.filter(value => !isNaN(value) && value > 0);
    const colorTotalProduct = numericValues.length;
    const colorTotalMeter = numericValues.reduce((acc, value) => acc + value, 0);
    return { colorTotalProduct, colorTotalMeter };
  };

  // Add selected color and product detail to the ProductList
  const handleAddProduct = () => {
    if (importData.Color && importData.ProductDetail) {
      const productValues = importData.ProductDetail.split(',').map((item) => parseFloat(item.trim()) || 0);

      // Add the new color and product detail to the ProductList dictionary
      const updatedProductList = {
        ...importData.ProductList,
        [importData.Color]: productValues
      };

      // Calculate totals after adding the new product
      const { totalProduct, totalMeter } = calculateTotals(updatedProductList);

      setImportData((prev) => ({
        ...prev,
        ProductList: updatedProductList, // Update the ProductList
        totalProduct,                    // Update total product count
        TotalMeter: totalMeter,          // Update total meter count
        Color: '',                       // Reset Color field
        ProductDetail: ''                // Reset ProductDetail field
      }));
    }
  };

  // Save the import data to DynamoDB using the provided REST API
  const handleSave = async () => {
    // Calculate the Detail field based on the ProductList
    const detail = {};
    Object.keys(importData.ProductList).forEach((color) => {
      const { colorTotalProduct, colorTotalMeter } = calculateColorTotals(importData.ProductList[color]);
      detail[color] = {
        TotalProduct: colorTotalProduct,
        TotalMeter: `${colorTotalMeter} meters`
      };
    });

    // Prepare the request body to match the DynamoDB table structure
    const requestBody = {
      Customer: importData.Customer,
      TotalAmount: Number(importData.TotalAmount),  // Convert to number
      ProductList: importData.ProductList,          // Pass the ProductList dictionary
      TotalProduct: importData.totalProduct,        // Total product count
      TotalMeter: `${importData.TotalMeter} meters`,  // Convert total meters to string with unit
      Status: importData.Status,                    // Import/Export status
      Note: importData.Note || '',                  // Optional note field
      Detail: detail                                // Detailed breakdown of total product and meters for each color
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
        ProductList: {},
        totalProduct: 0,
        TotalMeter: 0,
        Status: 'Import' // Reset status to 'Import'
      });
    }
  }, [isVisible]);

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
            {colors && colors.length > 0 ? (
              colors.map((color, index) => (
                <option key={index} value={color}>{color}</option>
              ))
            ) : (
              <option value="">No colors available</option>
            )}
          </select>

          <input
            type="text"
            name="ProductDetail"
            placeholder="Product Detail (comma-separated numbers)"
            value={importData.ProductDetail}
            onChange={handleInputChange}
          />

          <button onClick={handleAddProduct} disabled={!importData.Color || !importData.ProductDetail}>
            Add Product
          </button>

          <div className="product-list">
            <h4>Added Products</h4>
            <ul>
              {Object.keys(importData.ProductList).map((color, index) => {
                const { colorTotalProduct, colorTotalMeter } = calculateColorTotals(importData.ProductList[color]);
                return (
                  <li key={index}>
                    <strong>{color}</strong>: {importData.ProductList[color].join(', ')}
                    <p> - Total Product: {colorTotalProduct}</p>
                    <p> - Total Meter: {colorTotalMeter} meters</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="totals">
            <p><strong>Overall Total Product:</strong> {importData.totalProduct}</p>
            <p><strong>Overall Total Meter:</strong> {importData.TotalMeter} meters</p>
          </div>

          <input
            type="number"
            name="TotalAmount"
            placeholder="Total Amount"
            value={importData.TotalAmount}
            onChange={handleInputChange}
          />

          <input type="hidden" name="Status" value={importData.Status} />

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
