import React, { useState } from 'react';
import './ImportProductModal.css'; // Import styles for the modal

const ImportProductModal = ({ onClose }) => {
  const [importedProduct, setImportedProduct] = useState({
    ProductID: '',
    Color: '',
    ProductDetail: [],
    TotalMeter: '',
    totalProduct: ''
  });
  const [currentDetail, setCurrentDetail] = useState(''); // State to handle each product detail input

  // Handle input change for the import form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImportedProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding a new detail to ProductDetail array
  const handleAddProductDetail = () => {
    if (currentDetail && !isNaN(currentDetail)) {
      setImportedProduct((prev) => {
        const updatedProductDetail = [...prev.ProductDetail, parseFloat(currentDetail)];
        const totalMeter = updatedProductDetail.reduce((sum, num) => sum + num, 0); // Calculate total meter
        const totalProductCount = updatedProductDetail.length; // Calculate total number of items

        return {
          ...prev,
          ProductDetail: updatedProductDetail,
          TotalMeter: `${totalMeter} meters`, // Update TotalMeter automatically
          totalProduct: totalProductCount // Update totalProduct automatically
        };
      });
      setCurrentDetail(''); // Clear the input field after adding
    }
  };

  const handleSubmit = () => {
    console.log('Imported Product:', importedProduct);
    // Handle the submission logic here, such as sending the data to the server
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Import Product</h3>
        <input
          type="text"
          name="ProductID"
          placeholder="Mã Sản Phẩm"
          value={importedProduct.ProductID}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="Color"
          placeholder="Màu Sắc"
          value={importedProduct.Color}
          onChange={handleInputChange}
        />
        <div className="product-detail-section">
          <input
            type="number"
            placeholder="Nhập Chi Tiết Sản Phẩm"
            value={currentDetail}
            onChange={(e) => setCurrentDetail(e.target.value)}
          />
          <button className="add-detail-button" onClick={handleAddProductDetail}>
            +
          </button>
        </div>
        <ul className="product-detail-list">
          {importedProduct.ProductDetail.map((detail, index) => (
            <li key={index}>
              {detail} meters
            </li>
          ))}
        </ul>
        <div className="total-fields">
          <div>
            <label>Tổng Sản Phẩm:</label>
            <input type="text" name="totalProduct" value={importedProduct.totalProduct} readOnly />
          </div>
          <div>
            <label>Tổng Mét:</label>
            <input type="text" name="TotalMeter" value={importedProduct.TotalMeter} readOnly />
          </div>
        </div>
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Lưu</button>
          <button onClick={onClose}>Huỷ</button>
        </div>
      </div>
    </div>
  );
};

export default ImportProductModal;
