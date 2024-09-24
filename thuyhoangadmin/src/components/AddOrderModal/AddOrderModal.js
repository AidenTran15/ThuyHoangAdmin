import React, { useState } from 'react';
// import './OrderTable.css'; 

const AddOrderModal = ({ newOrder, setNewOrder, handleAddOrderSaveClick, setIsAddingNew }) => {
  const [product, setProduct] = useState({ color: 'red', size: 30, quantity: 1 });

  // Handle product changes
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index][field] = value;
    setNewOrder({ ...newOrder, productList: updatedProducts });
  };

  const addProduct = () => {
    setNewOrder((prev) => ({
      ...prev,
      productList: [...prev.productList, { color: 'red', size: 30, quantity: 1 }],
    }));
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
        <h3>Add New Order</h3>
        <input
          type="text"
          name="customer"
          placeholder="Customer"
          value={newOrder.customer}
          onChange={handleNewOrderInputChange}
          style={{
            padding: '10px',
            width: '100%',
            marginBottom: '15px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />

        {newOrder.productList.map((product, index) => (
          <div key={index} className="product-item">
            <label>Color:</label>
            <select
              value={product.color}
              onChange={(e) => handleProductChange(index, 'color', e.target.value)}
            >
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="yellow">Yellow</option>
            </select>

            <label>Size:</label>
            <select
              value={product.size}
              onChange={(e) => handleProductChange(index, 'size', e.target.value)}
            >
              <option value={30}>30</option>
              <option value={32}>32</option>
              <option value={33}>33</option>
              <option value={34}>34</option>
              <option value={35}>35</option>
              <option value={36}>36</option>
            </select>

            <label>Quantity:</label>
            <input
              type="number"
              value={product.quantity}
              onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
            />
          </div>
        ))}

        <button className="add-product-button" onClick={addProduct}>
          Add Another Product
        </button>

        <input
          type="number"
          name="total"
          placeholder="Total"
          value={newOrder.total}
          onChange={handleNewOrderInputChange}
          style={{
            padding: '10px',
            width: '100%',
            marginTop: '15px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="number"
          name="totalQuantity"
          placeholder="Total Quantity"
          value={newOrder.totalQuantity}
          onChange={handleNewOrderInputChange}
          style={{
            padding: '10px',
            width: '100%',
            marginTop: '15px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={newOrder.status}
          onChange={handleNewOrderInputChange}
          style={{
            padding: '10px',
            width: '100%',
            marginTop: '15px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />

        <div style={{ marginTop: '20px' }}>
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
