import React, { useState, useEffect } from 'react';
import './ExportProductModal.css'; // Import styles for the modal

const ExportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [exportData, setExportData] = useState({
    Customer: '',
    TotalAmount: '',
    ProductDetails: [],  // Store multiple products details
    currentProductDetail: [],  // Store current selected product details
    Color: '',
    totalProduct: 0,
    TotalMeter: 0,
    Status: 'Export',
    Note: ''
  });
  const [availableProductDetails, setAvailableProductDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes for export data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch product details for selected color
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (exportData.Color) {
        try {
          const response = await fetch(`https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get?color=${encodeURIComponent(exportData.Color)}`);
          if (response.ok) {
            const data = await response.json();
            const parsedData = typeof data.body === 'string' ? JSON.parse(data.body) : data;
            const matchingItem = parsedData.find(item => item.Color === exportData.Color);
            if (matchingItem) {
              // Include an ID property to differentiate identical product details
              const productDetailsWithId = matchingItem.ProductDetail.map((item, index) => ({
                id: `${matchingItem.Color}-${index}`,  // Unique ID for each product detail
                value: item
              }));
              setAvailableProductDetails(productDetailsWithId);
            }
          } else {
            setAvailableProductDetails([]);
            console.error(`Failed to fetch details for color ${exportData.Color}. Status: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error fetching details for color ${exportData.Color}:`, error);
          setAvailableProductDetails([]);
        }
      }
    };

    fetchProductDetails();
  }, [exportData.Color]);

  // Handle selecting a product detail
  const handleSelectProductDetail = (selectedDetail) => {
    setExportData((prev) => {
      const alreadySelected = prev.currentProductDetail.some(item => item.id === selectedDetail.id);
      const updatedSelection = alreadySelected
        ? prev.currentProductDetail.filter(detail => detail.id !== selectedDetail.id)
        : [...prev.currentProductDetail, selectedDetail];

      return {
        ...prev,
        currentProductDetail: updatedSelection,
        totalProduct: updatedSelection.length,
        TotalMeter: updatedSelection.reduce((acc, item) => acc + item.value, 0)
      };
    });
  };

  // Handle saving the current product and adding more
  const handleAddMore = () => {
    if (exportData.Color && exportData.currentProductDetail.length > 0) {
      setExportData((prev) => ({
        ...prev,
        ProductDetails: [...prev.ProductDetails, {
          Color: prev.Color,
          ProductDetail: prev.currentProductDetail.map(item => item.value)  // Only store values
        }],
        Color: '',  // Reset color
        currentProductDetail: [],  // Reset selected details
        totalProduct: 0,
        TotalMeter: 0
      }));
      setAvailableProductDetails([]);  // Clear available details for next selection
    }
  };

  // Save export data
  const handleSave = async () => {
    setErrorMessage('');
    
    const requestBody = {
      Customer: exportData.Customer,
      TotalAmount: Number(exportData.TotalAmount),
      ProductDetails: exportData.ProductDetails,
      Status: exportData.Status,
      Note: exportData.Note || ''
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
      onSave(exportData);
      handleClose();
    } catch (error) {
      console.error('Error while adding data:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setExportData({
        Customer: '',
        TotalAmount: '',
        ProductDetails: [],
        currentProductDetail: [],
        Color: '',
        totalProduct: 0,
        TotalMeter: 0,
        Status: 'Export',
        Note: ''
      });
      setAvailableProductDetails([]);
    }
  }, [isVisible]);

  return (
    isVisible && (
      <div className="export-modal">
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

          {availableProductDetails.length > 0 && (
            <div className="available-products">
              <h4>Available Product Details for {exportData.Color}:</h4>
              <div className="product-detail-list">
                {availableProductDetails.map((detail) => (
                  <div
                    key={detail.id}
                    className={`product-detail-item ${exportData.currentProductDetail.some(item => item.id === detail.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectProductDetail(detail)}
                  >
                    {detail.value} meters
                  </div>
                ))}
              </div>
            </div>
          )}

          {exportData.currentProductDetail.length > 0 && (
            <div className="selected-products">
              <h4>Selected Product Details for {exportData.Color}:</h4>
              <ul>
                {exportData.currentProductDetail.map((detail, index) => (
                  <li key={`${detail.id}-${index}`}>{detail.value} meters</li>
                ))}
              </ul>
              <p><strong>Overall Total Product:</strong> {exportData.totalProduct}</p>
              <p><strong>Overall Total Meter:</strong> {exportData.TotalMeter} meters</p>
            </div>
          )}

          {exportData.currentProductDetail.length > 0 && (
            <button className="add-more-button" onClick={handleAddMore}>Add More</button>
          )}

          {/* Display summary of all selected products */}
          {exportData.ProductDetails.length > 0 && (
            <div className="selected-summary">
              <h4>Selected Products Summary:</h4>
              <ul>
                {exportData.ProductDetails.map((item, index) => (
                  <li key={`${item.Color}-${index}`}>
                    <strong>Color:</strong> {item.Color}, <strong>Details:</strong> {item.ProductDetail.join(', ')} meters
                  </li>
                ))}
              </ul>
            </div>
          )}

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
