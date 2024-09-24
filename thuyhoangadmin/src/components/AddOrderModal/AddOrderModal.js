import React, { useState } from 'react';
import './AddOrderModal.css';

const AddOrderModal = ({ newOrder, setNewOrder, handleAddOrderSaveClick, setIsAddingNew }) => {
  // Handle product changes
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index][field] = value;
    setNewOrder({ ...newOrder, productList: updatedProducts });
  };

  const addProduct = () => {
    setNewOrder((prev) => ({
      ...prev,
      productList: [
        ...prev.productList,
        { color: 'red', size: 30, quantity: 1, isConfirmed: false },
      ],
    }));
  };

  const confirmProduct = (index) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index].isConfirmed = true; // Lock the product after confirmation
    setNewOrder({ ...newOrder, productList: updatedProducts });
  };

  const removeProduct = (index) => {
    const updatedProducts = newOrder.productList.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, productList: updatedProducts });
  };

  const handleNewOrderInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Add New Order</h3>

        <div className="input-group">
          <label className="input-label">Customer Name</label>
          <input
            type="text"
            name="customer"
            placeholder="Enter customer name"
            value={newOrder.customer}
            onChange={handleNewOrderInputChange}
            className="input-field"
          />
        </div>

        {newOrder.productList.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-details-row">
              {/* If the product is not confirmed, allow editing; otherwise, display details */}
              {product.isConfirmed ? (
                <>
                  <div className="input-group">
                    <span className="input-label">Color</span>
                    <span className="locked-field">{product.color}</span>
                  </div>
                  <div className="input-group">
                    <span className="input-label">Size</span>
                    <span className="locked-field">{product.size}</span>
                  </div>
                  <div className="input-group">
                    <span className="input-label">Quantity</span>
                    <span className="locked-field">{product.quantity}</span>
                  </div>
                  <button
                    className="remove-product-button"
                    onClick={() => removeProduct(index)}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label className="input-label">Color</label>
                    <select
                      value={product.color}
                      onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                      className="input-field"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="yellow">Yellow</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Size</label>
                    <select
                      value={product.size}
                      onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                      className="input-field"
                    >
                      <option value={30}>30</option>
                      <option value={32}>32</option>
                      <option value={33}>33</option>
                      <option value={34}>34</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Quantity</label>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <button
                    className="confirm-product-button"
                    onClick={() => confirmProduct(index)}
                  >
                    Add 
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        <button className="add-product-button" onClick={addProduct}>
           Add More 
        </button>

        <div className="input-group">
          <label className="input-label">Total Amount</label>
          <input
            type="number"
            name="total"
            placeholder="Enter total amount"
            value={newOrder.total}
            onChange={handleNewOrderInputChange}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Total Quantity</label>
          <input
            type="number"
            name="totalQuantity"
            placeholder="Enter total quantity"
            value={newOrder.totalQuantity}
            onChange={handleNewOrderInputChange}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Order Status</label>
          <input
            type="text"
            name="status"
            placeholder="Order status"
            value={newOrder.status}
            onChange={handleNewOrderInputChange}
            className="input-field"
          />
        </div>

        <div className="modal-footer">
          <button className="save-button" onClick={handleAddOrderSaveClick}>
            Save
          </button>
          <button className="cancel-button" onClick={() => setIsAddingNew(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;
