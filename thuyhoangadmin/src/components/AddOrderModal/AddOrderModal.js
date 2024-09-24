import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AddOrderModal.css';

const AddOrderModal = ({ newOrder, setNewOrder, handleAddOrderSaveClick, handleClose }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers when the component mounts
  useEffect(() => {
    axios.get('https://twnbtj6wuc.execute-api.ap-southeast-2.amazonaws.com/prod/customers')
      .then(response => {
        const customerData = JSON.parse(response.data.body);
        setCustomers(Array.isArray(customerData) ? customerData : []);
        setLoadingCustomers(false);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
        setCustomerError('Error fetching customers');
        setLoadingCustomers(false);
      });
  }, []);

  // Initialize with one empty product if the productList is empty
  useEffect(() => {
    if (newOrder.productList.length === 0) {
      setNewOrder((prev) => ({
        ...prev,
        productList: [
          { color: 'red', size: 30, quantity: 10, isConfirmed: false },
        ],
      }));
    }
  }, [newOrder.productList.length, setNewOrder]);

  // Automatically update the total quantity when the product list changes
  useEffect(() => {
    const totalQuantity = newOrder.productList.reduce((total, product) => total + parseInt(product.quantity || 0), 0);
    console.log('Calculated Total Quantity:', totalQuantity);  // Log total quantity
    setNewOrder((prev) => ({
      ...prev,
      totalQuantity,
    }));
  }, [newOrder.productList, setNewOrder]);

  // Calculate the total amount based on total quantity and selected customer's pants price
  useEffect(() => {
    if (selectedCustomer && newOrder.totalQuantity) {
      const pantsPrice = selectedCustomer.short_price || 0;  // Use the correct field for pants price
      const totalAmount = newOrder.totalQuantity * pantsPrice;
      
      console.log('Pants Price:', pantsPrice);  // Log to check the pants price
      console.log('Total Quantity:', newOrder.totalQuantity);  // Log to check the total quantity
      console.log('Total Amount:', totalAmount);  // Log to check the calculated total amount

      setNewOrder((prev) => ({
        ...prev,
        total: totalAmount,
      }));
    }
  }, [selectedCustomer, newOrder.totalQuantity, setNewOrder]);

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
        { color: 'red', size: 30, quantity: 10, isConfirmed: false },
      ],
    }));
  };

  const confirmProduct = (index) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index].isConfirmed = true;
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

  // Handle customer selection from the dropdown and find selected customer details
  const handleCustomerChange = (e) => {
    const selectedCustomerName = e.target.value;
    const customer = customers.find(c => c.name === selectedCustomerName);
    setSelectedCustomer(customer);  // Set the selected customer for later use
    setNewOrder((prev) => ({
      ...prev,
      customer: selectedCustomerName,
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Add New Order</h3>

        <div className="input-group">
          <label className="input-label">Customer Name</label>
          {loadingCustomers ? (
            <p>Loading customers...</p>
          ) : customerError ? (
            <p>{customerError}</p>
          ) : (
            <select
              name="customer"
              value={newOrder.customer || ''}
              onChange={handleCustomerChange}
              className="input-field"
            >
              <option value="" disabled>Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.phone_number} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {newOrder.productList.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-row">
              {/* Color Field */}
              <div className="product-field-group">
                <label className="input-label">Color</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.color}</span>
                ) : (
                  <select
                    value={product.color}
                    onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                    className="input-field"
                  >
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                  </select>
                )}
              </div>

              {/* Size Field */}
              <div className="product-field-group">
                <label className="input-label">Size</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.size}</span>
                ) : (
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
                )}
              </div>

              {/* Quantity Field */}
              <div className="product-field-group">
                <label className="input-label">Quantity</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.quantity}</span>
                ) : (
                  <select
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    className="input-field"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={40}>40</option>
                    <option value={50}>50</option>
                  </select>
                )}
              </div>

              {/* Add or Remove Button */}
              {!product.isConfirmed ? (
                <button className="add-button" onClick={() => confirmProduct(index)}>
                  Add
                </button>
              ) : (
                <button className="remove-product-button" onClick={() => removeProduct(index)}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {newOrder.productList.some((product) => product.isConfirmed) && (
          <button className="add-product-button" onClick={addProduct}>
            Add More
          </button>
        )}

        <div className="input-group">
          <label className="input-label">Total Quantity</label>
          <input
            type="number"
            name="totalQuantity"
            value={newOrder.totalQuantity}
            readOnly
            className="input-field"
          />
        </div>

        {/* Automatically calculated total amount */}
        <div className="input-group">
          <label className="input-label">Total Amount</label>
          <input
            type="number"
            name="total"
            value={newOrder.total}
            readOnly
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
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOrderModal;
