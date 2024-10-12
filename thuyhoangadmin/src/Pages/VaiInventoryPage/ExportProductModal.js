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
  const [isLoading, setIsLoading] = useState(false); // Add loading state

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
    if (isLoading) return; // Prevent interaction during loading

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

      // Remove color from SelectedProducts if no ProductDetail selected
      const finalSelections = updatedSelections.filter(
        (selection) => selection.ProductDetail.length > 0
      );

      // Calculate the overall total product count and total meters
      const overallTotalProduct = finalSelections.reduce(
        (total, selection) => total + selection.ProductDetail.length,
        0
      );
      const overallTotalMeter = finalSelections.reduce(
        (total, selection) =>
          total +
          selection.ProductDetail.reduce((acc, val) => acc + val.value, 0),
        0
      );

      // Determine whether to show the Add More button
      const showAddMoreButton = finalSelections.length > 0 && overallTotalProduct > 0;

      setShowAddMore(showAddMoreButton); // Show Add More button when a product is selected

      return {
        ...prev,
        SelectedProducts: finalSelections,
        totalProduct: overallTotalProduct,
        TotalMeter: overallTotalMeter
      };
    });
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

    // Validate required fields
    if (!exportData.Customer || !exportData.TotalAmount || exportData.totalProduct === 0) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin trước khi lưu.');
      return;
    }

    setIsLoading(true); // Start loading

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

      // For each selected color, update the product database
      for (const selection of exportData.SelectedProducts) {
        const productID = productIDs[selection.Color];
        if (!productID) {
          throw new Error(`ProductID not found for color ${selection.Color}`);
        }

        // Fetch existing product details to update the inventory correctly
        const fetchResponse = await fetch(
          `https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get?color=${encodeURIComponent(
            selection.Color
          )}`
        );

        if (!fetchResponse.ok) {
          throw new Error(
            `Failed to fetch existing product details for color ${selection.Color}. Status: ${fetchResponse.status}`
          );
        }

        const data = await fetchResponse.json();
        const parsedData =
          typeof data.body === 'string' ? JSON.parse(data.body) : data;
        const matchingItem = parsedData.find(
          (item) => item.Color === selection.Color
        );

        if (!matchingItem) {
          throw new Error(`No existing product found for color ${selection.Color}`);
        }

        // Remove selected product details from existing product details
        const updatedProductDetails = matchingItem.ProductDetail.filter(
          (detail, index) => {
            // Check if this detail was not selected for export
            return !selection.ProductDetail.some(
              (selectedDetail) =>
                selectedDetail.value === detail &&
                selectedDetail.index === index
            );
          }
        );

        const totalMeter = updatedProductDetails.reduce((sum, num) => sum + num, 0);

        const updateRequestBody = {
          ProductID: productID,
          Color: selection.Color,
          ProductDetail: updatedProductDetails,
          totalProduct: updatedProductDetails.length,
          TotalMeter: `${totalMeter} meters`
        };

        // Make a PUT request to update the product database
        const updateResponse = await fetch(
          'https://2t6r0vxhzf.execute-api.ap-southeast-2.amazonaws.com/prod/update',
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

      // Close the modal after successful save
      handleClose();
      onSave(); // Call onSave without parameters
    } catch (error) {
      console.error('Error while saving data:', error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false); // Stop loading
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
      setErrorMessage('');
      setIsLoading(false);
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
            disabled={isLoading}
          />

          {/* Select Color Dropdown */}
          <label>Chọn Màu</label> {/* Select Color */}
          <select
            name="Color"
            value={exportData.Color}
            onChange={handleInputChange}
            className="modal-input"
            disabled={isLoading}
          >
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
                    onClick={!isLoading ? () => handleSelectProductDetail(detail, index) : null}
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
              <h4>Sản Phẩm Đã Chọn</h4> {/* Selected Products */}

              {/* Display Each Selected Color and Its Details */}
              {exportData.SelectedProducts.map((selection, index) => (
                <div key={index} className="product-item">
                  <strong>{selection.Color}:</strong> {/* Display Color Name */}
                  <ul className="product-details">
                    {selection.ProductDetail.map((detail, idx) => (
                      <li key={idx}>{detail.value} mét</li> /* {detail} meters */
                    ))}
                  </ul>
                </div>
              ))}

              {/* Totals Section */}
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

          {/* Add More Button */}
          {showAddMore && (
            <button onClick={handleAddMore} className="add-more-button" disabled={isLoading}>
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
            disabled={isLoading}
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
            disabled={isLoading}
          />

          {/* Save and Cancel Buttons */}
          <div className="modal-buttons">
            <button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu'} {/* Save */}
            </button>
            <button onClick={handleClose} disabled={isLoading}>
              Hủy
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ExportProductModal;
