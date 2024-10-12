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
          <h3>Xuất Sản Phẩm</h3> {/* Export Product */}
  
          {errorMessage && <p className="error-message">{errorMessage}</p>}
  
          {/* Customer Name Input */}
          <label>Tên Khách Hàng</label> {/* Customer Name */}
          <input
            type="text"
            name="Customer"
            placeholder="Nhập tên khách hàng"
            value={exportData.Customer}
            onChange={handleInputChange}
            className="modal-input"
          />
  
          {/* Select Color Dropdown */}
          <label>Chọn Màu</label> {/* Select Color */}
          <select name="Color" value={exportData.Color} onChange={handleInputChange} className="modal-input">
            <option value="">Chọn màu</option> {/* Choose a color */}
            {colors.map((color, index) => (
              <option key={index} value={color}>
                {color}
              </option>
            ))}
          </select>
  
          {/* Display Available Product Details */}
          {availableProductDetails.length > 0 && (
            <div className="available-products">
              <h4>Chi Tiết Số Mét Của Màu {exportData.Color}:</h4> {/* Available Product Details */}
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
                    {detail} mét {/* {detail} meters */}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Display Selected Products Section */}
          {exportData.SelectedProducts.length > 0 && (
            <div className="selected-products">
              <h4>Sản Phẩm Đã Chọn</h4> {/* Current Selections */}
  
              {/* Display Each Selected Color and Its Details */}
              {exportData.SelectedProducts.map((selection, index) => (
                <div key={index} className="product-item">
                  <strong>{selection.Color}:</strong> {/* Display Color Name */}
                  <ul className="product-details">
                    {selection.ProductDetail.map((detail, index) => (
                      <li key={index}>{detail.value} mét</li> /* {detail} meters */
                    ))}
                  </ul>
                </div>
              ))}
  
              {/* Totals Section - Similar to Import Modal */}
              <div className="totals-section">
                <div className="metric">
                  <span className="metric-value">Tổng Số Lượng Sản Phẩm: {exportData.totalProduct}</span> {/* Overall Total Product */}
                </div>
                <div className="metric">
                  <span className="metric-value">Tổng Số Mét: {exportData.TotalMeter} mét</span> {/* Overall Total Meter */}
                </div>
              </div>
            </div>
          )}
  
          {/* Move the Add More Button Here */}
          {showAddMore && (
            <button onClick={handleAddMore} className="add-more-button">
              Thêm Màu Khác {/* Add More */}
            </button>
          )}
  
          {/* Total Amount Input */}
          <label>Tổng Số Tiền</label> {/* Total Amount */}
          <input
            type="number"
            name="TotalAmount"
            placeholder="Tổng số tiền"
            value={exportData.TotalAmount}
            onChange={handleInputChange}
            className="modal-input"
          />
  
          {/* Additional Note Textarea */}
          <label>Ghi Chú Thêm</label> {/* Additional Note */}
          <textarea
            name="Note"
            placeholder="Thông tin bổ sung..."
            value={exportData.Note}
            onChange={handleInputChange}
            rows="3"
            className="modal-input"
          />
  
          {/* Save and Cancel Buttons */}
          <div className="modal-buttons">
            <button onClick={handleSave}>Lưu</button> {/* Save */}
            <button onClick={handleClose}>Hủy</button> {/* Cancel */}
          </div>
        </div>
      </div>
    )
  );
  
  
};

export default ExportProductModal;