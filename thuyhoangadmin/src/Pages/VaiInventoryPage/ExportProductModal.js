import React, { useState, useEffect } from 'react';
import './ExportProductModal.css'; // Import styles for the modal

const ExportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [exportData, setExportData] = useState({
    Customer: '',
    TotalAmount: '',
    Color: '',
    ProductDetail: [],
    SelectedProductDetails: [], // Store selected product details
    totalProduct: 0,
    TotalMeter: 0,
    Status: 'Export', // Set default status to 'Export'
    Note: ''          // New field for user note
  });
  const [availableProductDetails, setAvailableProductDetails] = useState([]); // Store available product details for selected color
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes for export data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle the selection of a color to fetch existing product details
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
              setAvailableProductDetails(matchingItem.ProductDetail || []);
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

  // Handle the selection of product details from availableProductDetails
  const handleSelectProductDetail = (selectedDetail) => {
    setExportData((prev) => {
      const alreadySelected = prev.SelectedProductDetails.includes(selectedDetail);
      const updatedSelection = alreadySelected
        ? prev.SelectedProductDetails.filter(detail => detail !== selectedDetail)
        : [...prev.SelectedProductDetails, selectedDetail];

      return {
        ...prev,
        SelectedProductDetails: updatedSelection,
        totalProduct: updatedSelection.length,
        TotalMeter: updatedSelection.reduce((acc, value) => acc + value, 0)
      };
    });
  };

  // Save the export data
  const handleSave = async () => {
    setErrorMessage(''); // Reset error message before saving

    // Prepare the request body to match the DynamoDB table structure
    const requestBody = {
      Customer: exportData.Customer,
      TotalAmount: Number(exportData.TotalAmount),
      ProductList: { [exportData.Color]: exportData.SelectedProductDetails }, // Include selected product details
      TotalProduct: exportData.totalProduct,
      TotalMeter: `${exportData.TotalMeter} meters`,
      Status: exportData.Status,
      Note: exportData.Note || '',
      Detail: { [exportData.Color]: { TotalProduct: exportData.totalProduct, TotalMeter: `${exportData.TotalMeter} meters` } }
    };

    try {
      // Make a POST request to add the data to TrackingInventory
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
      onSave(exportData); // Pass the data back to parent component if needed
      handleClose(); // Close the modal after successful save

    } catch (error) {
      console.error('Error while adding data:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    // Reset the export data and available product details when modal is opened or closed
    if (!isVisible) {
      setExportData({
        Customer: '',
        Color: '',
        TotalAmount: '',
        ProductDetail: [],
        SelectedProductDetails: [],
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

          {/* Display error message, if any */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Input for Customer Name */}
          <input
            type="text"
            name="Customer"
            placeholder="Customer Name"
            value={exportData.Customer}
            onChange={handleInputChange}
          />

          {/* Dropdown for Color selection populated with colors from parent component */}
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

          {/* Display available product details for the selected color */}
          {availableProductDetails.length > 0 && (
            <div className="available-products">
              <h4>Available Product Details for {exportData.Color}:</h4>
              <div className="product-detail-list">
                {availableProductDetails.map((detail, index) => (
                  <div
                    key={index}
                    className={`product-detail-item ${exportData.SelectedProductDetails.includes(detail) ? 'selected' : ''}`}
                    onClick={() => handleSelectProductDetail(detail)}
                  >
                    {detail} meters
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display selected product details */}
          {exportData.SelectedProductDetails.length > 0 && (
            <div className="selected-products">
              <h4>Selected Product Details:</h4>
              <ul>
                {exportData.SelectedProductDetails.map((detail, index) => (
                  <li key={`${detail}-${index}`}>{detail} meters</li>
                ))}
              </ul>
            </div>
          )}

          {/* Display calculated overall total product and total meter */}
          <div className="totals">
            <p><strong>Overall Total Product:</strong> {exportData.totalProduct}</p>
            <p><strong>Overall Total Meter:</strong> {exportData.TotalMeter} meters</p>
          </div>

          {/* Input for Total Amount */}
          <input
            type="number"
            name="TotalAmount"
            placeholder="Total Amount"
            value={exportData.TotalAmount}
            onChange={handleInputChange}
          />

          {/* Input for Note */}
          <textarea
            name="Note"
            placeholder="Additional Note"
            value={exportData.Note}
            onChange={handleInputChange}
            rows="3"
          />

          {/* Modal buttons for save and cancel */}
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
