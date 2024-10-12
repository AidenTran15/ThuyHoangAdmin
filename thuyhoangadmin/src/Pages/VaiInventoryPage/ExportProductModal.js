import React, { useState, useEffect } from 'react';
import './ExportProductModal.css'; // Import styles for the modal

const ExportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [exportData, setExportData] = useState({
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
  const [availableProductDetails, setAvailableProductDetails] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddMore, setShowAddMore] = useState(false);
  const [productIDs, setProductIDs] = useState({});
  const [isLoading, setIsLoading] = useState(false); // New loading state

  useEffect(() => {
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
      const currentColorSelection = prev.SelectedProducts.find(
        (selection) => selection.Color === prev.Color
      );

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
            )
          : [
              ...(currentColorSelection ? currentColorSelection.ProductDetail : []),
              { value: selectedDetail, index }
            ];

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

      return {
        ...prev,
        SelectedProducts: updatedSelections,
        totalProduct: overallTotalProduct,
        TotalMeter: overallTotalMeter
      };
    });
    setShowAddMore(true);
  };

  const handleAddMore = () => {
    setExportData((prev) => ({
      ...prev,
      Color: '',
      ProductDetail: []
    }));
    setAvailableProductDetails([]);
    setShowAddMore(false);
  };

  const handleSave = async () => {
    setErrorMessage('');
    setIsLoading(true); // Set loading to true before saving

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

        const updateResponse = await fetch(
          'https://zvflcuqc6c.execute-api.ap-southeast-2.amazonaws.com/prod/export',
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
      }

      onSave(exportData);
      handleClose();
    } catch (error) {
      console.error('Error while saving data:', error);
      setErrorMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false); // Stop loading after saving process completes
    }
  };

  useEffect(() => {
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
          <h3>Xuất Sản Phẩm</h3>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <label>Tên Khách Hàng</label>
          <input
            type="text"
            name="Customer"
            placeholder="Nhập tên khách hàng"
            value={exportData.Customer}
            onChange={handleInputChange}
            className="modal-input"
          />

          <label>Chọn Màu</label>
          <select name="Color" value={exportData.Color} onChange={handleInputChange} className="modal-input">
            <option value="">Chọn màu</option>
            {colors.map((color, index) => (
              <option key={index} value={color}>
                {color}
              </option>
            ))}
          </select>

          {availableProductDetails.length > 0 && (
            <div className="available-products">
              <h4>Chi Tiết Số Mét Của Màu {exportData.Color}:</h4>
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
                    {detail} mét
                  </div>
                ))}
              </div>
            </div>
          )}

          {exportData.SelectedProducts.length > 0 && (
            <div className="selected-products">
              <h4>Sản Phẩm Đã Chọn</h4>
              {exportData.SelectedProducts.map((selection, index) => {
                const colorTotalProduct = selection.ProductDetail.length;
                const colorTotalMeter = selection.ProductDetail.reduce(
                  (acc, detail) => acc + detail.value,
                  0
                );
                return (
                  <div key={index} className="product-item">
                    <strong>{selection.Color}:</strong>
                    <ul className="product-details">
                      {selection.ProductDetail.map((detail, index) => (
                        <li key={index}>{detail.value} mét</li>
                      ))}
                    </ul>
                    <div className="color-totals">
                      <p><strong>Tổng số cây:</strong> {colorTotalProduct}</p>
                      <p><strong>Tổng số mét:</strong> {colorTotalMeter} mét</p>
                    </div>
                  </div>
                );
              })}

              <div className="totals-section">
                <div className="metric">
                  <span className="metric-value"><strong>Tổng Số Lượng Sản Phẩm:</strong> {exportData.totalProduct}</span>
                </div>
                <div className="metric">
                  <span className="metric-value"><strong>Tổng Số Mét:</strong> {exportData.TotalMeter} mét</span>
                </div>
              </div>
            </div>
          )}

          {showAddMore && (
            <button onClick={handleAddMore} className="add-more-button">
              Thêm Màu Khác
            </button>
          )}

          <label>Tổng Số Tiền</label>
          <input
            type="number"
            name="TotalAmount"
            placeholder="Tổng số tiền"
            value={exportData.TotalAmount}
            onChange={handleInputChange}
            className="modal-input"
          />

          <label>Ghi Chú Thêm</label>
          <textarea
            name="Note"
            placeholder="Thông tin bổ sung..."
            value={exportData.Note}
            onChange={handleInputChange}
            rows="3"
            className="modal-input"
          />

          <div className="modal-buttons">
            <button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                'Lưu'
              )}
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
