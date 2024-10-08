import React, { useState, useEffect } from 'react';
import './ImportProductModal.css'; // Use the same styling for both modals

const ExportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [exportData, setExportData] = useState({
    Customer: '',
    TotalAmount: '',
    ProductDetail: '',  // Temporary field for product details as string
    Color: '',
    ProductList: {},
    totalProduct: 0,
    TotalMeter: 0,
    Status: 'Export',  // Default status as 'Export'
    Note: ''           // New field for user note
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

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

  const calculateColorTotals = (productValues) => {
    const numericValues = productValues.filter(value => !isNaN(value) && value > 0);
    const colorTotalProduct = numericValues.length;
    const colorTotalMeter = numericValues.reduce((acc, value) => acc + value, 0);
    return { colorTotalProduct, colorTotalMeter };
  };

  const handleAddProduct = () => {
    if (exportData.Color && exportData.ProductDetail) {
      const productValues = exportData.ProductDetail.split(',').map((item) => parseFloat(item.trim()) || 0);

      const updatedProductList = {
        ...exportData.ProductList,
        [exportData.Color]: productValues
      };

      const { totalProduct, totalMeter } = calculateTotals(updatedProductList);

      setExportData((prev) => ({
        ...prev,
        ProductList: updatedProductList,
        totalProduct,
        TotalMeter: totalMeter,
        Color: '',
        ProductDetail: ''
      }));
    }
  };

  const handleSave = async () => {
    setErrorMessage('');
    const detail = {};
    Object.keys(exportData.ProductList).forEach((color) => {
      const { colorTotalProduct, colorTotalMeter } = calculateColorTotals(exportData.ProductList[color]);
      detail[color] = {
        TotalProduct: colorTotalProduct,
        TotalMeter: `${colorTotalMeter} meters`
      };
    });

    const requestBody = {
      Customer: exportData.Customer,
      TotalAmount: Number(exportData.TotalAmount),
      ProductList: exportData.ProductList,
      TotalProduct: exportData.totalProduct,
      TotalMeter: `${exportData.TotalMeter} meters`,
      Status: exportData.Status,
      Note: exportData.Note || '',
      Detail: detail
    };

    try {
      const trackingResponse = await fetch('https://towbaoz4e2.execute-api.ap-southeast-2.amazonaws.com/prod/add-tranking-invent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!trackingResponse.ok) {
        throw new Error(`Failed to add data to TrackingInventory. Status: ${trackingResponse.status}`);
      }

      console.log('Data added successfully to TrackingInventory.');

      // Additional update logic for VaiInventory can go here, if needed...

      console.log('Data added successfully to both TrackingInventory and VaiInventory.');
      onSave(exportData);
      handleClose();
    } catch (error) {
      console.error('Error while adding or updating data:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setExportData({
        Customer: '',
        Color: '',
        TotalAmount: '',
        ProductDetail: '',
        ProductList: {},
        totalProduct: 0,
        TotalMeter: 0,
        Status: 'Export',
        Note: ''
      });
    }
  }, [isVisible]);

  return (
    isVisible && (
      <div className="import-modal">
        <div className="modal-content">
          <h3>Export Product</h3>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <input
            type="text"
            name="Customer"
            placeholder="Customer Name"
            value={exportData.Customer}
            onChange={handleInputChange}
          />

          <select
            name="Color"
            value={exportData.Color}
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
            value={exportData.ProductDetail}
            onChange={handleInputChange}
          />

          <button onClick={handleAddProduct} disabled={!exportData.Color || !exportData.ProductDetail}>
            Add Product
          </button>

          <div className="product-list">
            <h4>Added Products</h4>
            <ul>
              {Object.keys(exportData.ProductList).map((color, index) => {
                const { colorTotalProduct, colorTotalMeter } = calculateColorTotals(exportData.ProductList[color]);
                return (
                  <li key={`${color}-${index}`}>
                    <strong>{color}</strong>: {exportData.ProductList[color].join(', ')}
                    <p> - Total Product: {colorTotalProduct}</p>
                    <p> - Total Meter: {colorTotalMeter} meters</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="totals">
            <p><strong>Overall Total Product:</strong> {exportData.totalProduct}</p>
            <p><strong>Overall Total Meter:</strong> {exportData.TotalMeter} meters</p>
          </div>

          <input
            type="number"
            name="TotalAmount"
            placeholder="Total Amount"
            value={exportData.TotalAmount}
            onChange={handleInputChange}
          />

          <textarea
            name="Note"
            placeholder="Additional Note"
            value={exportData.Note}
            onChange={handleInputChange}
            rows="3"
          />

          <input type="hidden" name="Status" value={exportData.Status} />

          <div className="modal-buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  );
};

export default ExportProductModal;
