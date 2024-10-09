import React, { useState, useEffect } from 'react';
import './ExportProductModal.css'; // Import styles for the modal

const ExportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [exportData, setExportData] = useState({
    Customer: '',
    Color: '',
    ProductDetail: [],
    SelectedProducts: [], // Store selected products with color and details
    totalProduct: 0,
    TotalMeter: 0,
    TotalAmount: '',
    Status: 'Export',
    Note: ''
  });
  const [availableProductDetails, setAvailableProductDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddMore, setShowAddMore] = useState(false); // Show Add More button
  const [productIDs, setProductIDs] = useState({}); // Store ProductIDs for colors

  useEffect(() => {
    // Fetch product details and ProductID based on selected color
    const fetchProductDetails = async () => {
      if (exportData.Color) {
        try {
          const response = await fetch(
            `https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get?color=${encodeURIComponent(
              exportData.Color
            )}`
          );
          if (response.ok) {
            const data = await response.json();
            const parsedData =
              typeof data.body === 'string' ? JSON.parse(data.body) : data;
            const matchingItem = parsedData.find(
              (item) => item.Color === exportData.Color
            );
            if (matchingItem) {
              setAvailableProductDetails(matchingItem.ProductDetail || []);
              setProductIDs((prev) => ({
                ...prev,
                [exportData.Color]: matchingItem.ProductID,
              }));
            }
          } else {
            setAvailableProductDetails([]);
            console.error(
              `Failed to fetch details for color ${exportData.Color}. Status: ${response.status}`
            );
          }
        } catch (error) {
          console.error(
            `Error fetching details for color ${exportData.Color}:`,
            error
          );
          setAvailableProductDetails([]);
        }
      }
    };

    fetchProductDetails();
  }, [exportData.Color]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectProductDetail = (selectedDetail, index) => {
    setExportData((prev) => {
      // Check if the product detail is already selected for the current color
      const currentColorSelection = prev.SelectedProducts.find(
        (selection) => selection.Color === prev.Color
      );

      // Identify by both value and index to ensure uniqueness
      const selectedIndex = currentColorSelection
        ? currentColorSelection.ProductDetail.findIndex(
            (detail) =>
              detail.value === selectedDetail && detail.index === index
          )
        : -1;

      const updatedProductDetails =
        selectedIndex >= 0
          ? currentColorSelection.ProductDetail.filter(
              (detail) => detail.index !== index
            ) // Deselect if already selected
          : [
              ...(currentColorSelection ? currentColorSelection.ProductDetail : []),
              { value: selectedDetail, index }
            ]; // Add if not selected

      // Update the selected products list
      const updatedSelections = currentColorSelection
        ? prev.SelectedProducts.map((selection) =>
            selection.Color === prev.Color
              ? { ...selection, ProductDetail: updatedProductDetails }
              : selection
          )
        : [
            ...prev.SelectedProducts,
            { Color: prev.Color, ProductDetail: updatedProductDetails }
          ];

      // Calculate the overall total product count and total meters
      const overallTotalProduct = updatedSelections.reduce(
        (total, selection) => total + selection.ProductDetail.length,
        0
      );
      const overallTotalMeter = updatedSelections.reduce(
        (total, selection) =>
          total +
          selection.ProductDetail.reduce((acc, val) => acc + val.value, 0),
        0
      );

      // Determine whether to show the Add More button
      const showAddMoreButton = updatedSelections.length > 0 && overallTotalProduct > 0;

      return {
        ...prev,
        SelectedProducts: updatedSelections,
        totalProduct: overallTotalProduct,
        TotalMeter: overallTotalMeter
      };
    });
    setShowAddMore(true); // Show Add More button when a product is selected
  };

  const handleAddMore = () => {
    setExportData((prev) => ({
      ...prev,
      Color: '',
      ProductDetail: []
    }));
    setAvailableProductDetails([]); // Reset available product details for new selection
    setShowAddMore(false); // Hide Add More button until the next product is selected
  };

  const handleSave = async () => {
    setErrorMessage(''); // Reset error message before saving

    const requestBody = {
      Customer: exportData.Customer,
      TotalAmount: Number(exportData.TotalAmount),
      ProductList: exportData.SelectedProducts.reduce(
        (acc, selection) => ({
          ...acc,
          [selection.Color]: selection.ProductDetail.map((detail) => detail.value)
        }),
        {}
      ),
      TotalProduct: exportData.totalProduct,
      TotalMeter: `${exportData.TotalMeter} meters`,
      Status: exportData.Status,
      Note: exportData.Note || '',
      Detail: exportData.SelectedProducts.reduce(
        (acc, selection) => ({
          ...acc,
          [selection.Color]: {
            TotalProduct: selection.ProductDetail.length,
            TotalMeter: `${selection.ProductDetail.reduce(
              (acc, val) => acc + val.value,
              0
            )} meters`
          }
        }),
        {}
      )
    };

    try {
      // Make a POST request to add the data to TrackingInventory
      const trackingResponse = await fetch(
        'https://towbaoz4e2.execute-api.ap-southeast-2.amazonaws.com/prod/add-tranking-invent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!trackingResponse.ok) {
        throw new Error(
          `Failed to add data to TrackingInventory. Status: ${trackingResponse.status}`
        );
      }

      console.log('Data added successfully to TrackingInventory.');

      // For each selected color, call the lambda function to update the product database
      for (const selection of exportData.SelectedProducts) {
        const productID = productIDs[selection.Color];
        if (!productID) {
          throw new Error(`ProductID not found for color ${selection.Color}`);
        }

        const updateRequestBody = {
          ProductID: productID,
          Color: selection.Color,
          ProductDetail: selection.ProductDetail.map((detail) => detail.value),
          totalProduct: selection.ProductDetail.length,
          TotalMeter: `${selection.ProductDetail.reduce(
            (acc, val) => acc + val.value,
            0
          )} meters`
        };

        // Make a POST request to the lambda function to update the product database
        const updateResponse = await fetch(
          'https://zvflcuqc6c.execute-api.ap-southeast-2.amazonaws.com/prod/export', // Replace with your actual lambda function URL
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateRequestBody)
          }
        );

        if (!updateResponse.ok) {
          throw new Error(
            `Failed to update product database for color ${selection.Color}. Status: ${updateResponse.status}`
          );
        }

        console.log(
          `Product database updated successfully for color ${selection.Color}.`
        );
      }

      onSave(exportData); // Pass the data back to parent component if needed
      handleClose(); // Close the modal after successful save
    } catch (error) {
      console.error('Error while saving data:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    // Reset the export data and available product details when modal is opened or closed
    if (!isVisible) {
      setExportData({
        Customer: '',
        Color: '',
        ProductDetail: [],
        SelectedProducts: [],
        totalProduct: 0,
        TotalMeter: 0,
        TotalAmount: '',
        Status: 'Export',
        Note: ''
      });
      setAvailableProductDetails([]);
      setShowAddMore(false);
      setProductIDs({});
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
          <select name="Color" value={exportData.Color} onChange={handleInputChange}>
            <option value="">Select Color</option>
            {colors && colors.length > 0 ? (
              colors.map((color, index) => (
                <option key={index} value={color}>
                  {color}
                </option>
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
                    key={`${detail}-${index}`}
                    className={`product-detail-item ${
                      exportData.SelectedProducts.some(
                        (selection) =>
                          selection.Color === exportData.Color &&
                          selection.ProductDetail.some((pd) => pd.index === index)
                      )
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => handleSelectProductDetail(detail, index)}
                  >
                    {detail} meters
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display selected products */}
          {exportData.SelectedProducts.length > 0 && (
            <div className="selected-products">
              <h4>Current Selections:</h4>
              <ul>
                {exportData.SelectedProducts.map((selection, index) => (
                  <li key={index}>
                    <strong>Color:</strong> {selection.Color},{' '}
                    <strong>Details:</strong>{' '}
                    {selection.ProductDetail.map((detail) => detail.value).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Display calculated overall total product and total meter */}
          <div className="totals">
            <p>
              <strong>Overall Total Product:</strong> {exportData.totalProduct}
            </p>
            <p>
              <strong>Overall Total Meter:</strong> {exportData.TotalMeter} meters
            </p>
          </div>

          {/* Add More Button */}
          {showAddMore && (
            <button onClick={handleAddMore} className="add-more-button">
              Add More
            </button>
          )}

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
