import React, { useState, useEffect } from 'react';
import './ExportProductModal.css'; // Import styles for the modal

const ExportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [exportData, setExportData] = useState({
    Customer: '',
    TotalAmount: '',
    Color: '',
    ProductDetail: [],
    SelectedProductDetails: [],
    totalProduct: 0,
    TotalMeter: 0,
    Status: 'Export',
    Note: ''
  });
  const [availableProductDetails, setAvailableProductDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [productSelections, setProductSelections] = useState([]); // Store multiple product selections

  // Handle input changes for export data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch product details for the selected color
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
              // Assign unique IDs to each product detail to handle identical values
              const productDetailsWithIds = matchingItem.ProductDetail.map((detail, index) => ({
                id: `${index}-${detail}`, // Create unique ID using index and value
                value: detail,
              }));
              setAvailableProductDetails(productDetailsWithIds);
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

  // Handle the selection of product details based on unique ID
  const handleSelectProductDetail = (selectedDetail) => {
    setExportData((prev) => {
      const alreadySelected = prev.SelectedProductDetails.some(detail => detail.id === selectedDetail.id);
      const updatedSelection = alreadySelected
        ? prev.SelectedProductDetails.filter(detail => detail.id !== selectedDetail.id)
        : [...prev.SelectedProductDetails, selectedDetail];

      return {
        ...prev,
        SelectedProductDetails: updatedSelection,
        totalProduct: updatedSelection.length,
        TotalMeter: updatedSelection.reduce((acc, item) => acc + item.value, 0)
      };
    });
  };

  // Handle adding more products
  const handleAddMore = () => {
    setProductSelections((prev) => [...prev, exportData]);
    setExportData({
      ...exportData,
      Color: '',
      ProductDetail: [],
      SelectedProductDetails: [],
      totalProduct: 0,
      TotalMeter: 0,
    });
  };

  // Save the export data
  const handleSave = async () => {
    setErrorMessage('');

    // Combine all product selections
    const combinedProductSelections = [...productSelections, exportData];

    // Prepare the request body
    const requestBody = {
      Customer: exportData.Customer,
      TotalAmount: Number(exportData.TotalAmount),
      ProductList: combinedProductSelections.reduce((acc, item) => {
        acc[item.Color] = item.SelectedProductDetails.map(detail => detail.value); // Use only the value for storage
        return acc;
      }, {}),
      TotalProduct: combinedProductSelections.reduce((acc, item) => acc + item.totalProduct, 0),
      TotalMeter: `${combinedProductSelections.reduce((acc, item) => acc + item.TotalMeter, 0)} meters`,
      Status: exportData.Status,
      Note: exportData.Note || '',
      Detail: combinedProductSelections.reduce((acc, item) => {
        acc[item.Color] = { TotalProduct: item.totalProduct, TotalMeter: `${item.TotalMeter} meters` };
        return acc;
      }, {})
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
      onSave(combinedProductSelections); // Pass the data back to parent component if needed
      handleClose(); // Close the modal after successful save

    } catch (error) {
      console.error('Error while adding data:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
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
      setProductSelections([]);
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

          {/* Dropdown for Color selection */}
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

          {/* Available product details for selected color */}
          {availableProductDetails.length > 0 && (
            <div className="available-products">
              <h4>Available Product Details for {exportData.Color}:</h4>
              <div className="product-detail-list">
                {availableProductDetails.map((detail) => (
                  <div
                    key={detail.id}
                    className={`product-detail-item ${exportData.SelectedProductDetails.some(item => item.id === detail.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectProductDetail(detail)}
                  >
                    {detail.value} meters
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
                {exportData.SelectedProductDetails.map((detail) => (
                  <li key={detail.id}>{detail.value} meters</li>
                ))}
              </ul>
            </div>
          )}

          {/* Display all product selections */}
          {productSelections.length > 0 && (
            <div className="product-selections">
              <h4>Current Selections:</h4>
              <ul>
                {productSelections.map((selection, index) => (
                  <li key={index}>
                    <strong>Color:</strong> {selection.Color}, <strong>Details:</strong> {selection.SelectedProductDetails.map(detail => detail.value).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add More Button */}
          {exportData.SelectedProductDetails.length > 0 && (
            <button className="add-more-button" onClick={handleAddMore}>
              Add More
            </button>
          )}

          {/* Overall total details */}
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
