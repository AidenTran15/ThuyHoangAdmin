import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AddOrderModal.css';

const AddOrderModal = ({ newOrder, setNewOrder, handleAddOrderSaveClick, handleClose }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [uniqueColors, setUniqueColors] = useState([]); // Unique colors from the product table
  const [filteredSizes, setFilteredSizes] = useState({}); // Store available sizes based on selected color
  const [products, setProducts] = useState([]); // Store product list
  const [maxQuantities, setMaxQuantities] = useState({}); // Store max quantity based on selected color and size

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

  // Fetch products to get colors, sizes, and quantities
  useEffect(() => {
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        const productData = JSON.parse(response.data.body);
        setProducts(productData);
        console.log('Products array:', productData); // Debugging log to view products array

        // Extract unique colors from product data
        const colors = [...new Set(productData.map(product => product.Color))];
        setUniqueColors(colors);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  // Filter sizes based on selected color
  const filterSizesByColor = (color) => {
    const sizesForColor = products
      .filter((product) => product.Color === color)
      .map((product) => product.Size);
    setFilteredSizes({ [color]: [...new Set(sizesForColor)] }); // Set unique sizes for the selected color
  };

  // Get max quantity based on selected color and size by querying products array
  const getMaxQuantity = (color, size) => {
    console.log("Checking for color:", color, "and size:", size); // Debugging log

    // Ensure consistent data types: both color and size should be strings
    const normalizedColor = color.toString().toLowerCase();
    const normalizedSize = size.toString();

    // Find the product that matches the selected color and size
    const product = products.find((product) => 
      product.Color.toLowerCase() === normalizedColor && product.Size.toString() === normalizedSize
    );

    if (product) {
      console.log("Found product:", product); // Debugging log
      return product.Quantity; // Return the product's quantity
    } else {
      console.log("Product not found"); // Debugging log
      return 0; // If product not found, return 0
    }
  };

  // Initialize with one empty product and default status if the productList is empty
  useEffect(() => {
    if (newOrder.productList.length === 0) {
      setNewOrder((prev) => ({
        ...prev,
        productList: [
          { color: 'red', size: 30, quantity: 10, isConfirmed: false },
        ],
        status: 'pending', // Set default status to 'pending'
      }));
    }
  }, [newOrder.productList.length, setNewOrder]);

  // Automatically update the total quantity when the product list changes
  useEffect(() => {
    const totalQuantity = newOrder.productList.reduce((total, product) => total + parseInt(product.quantity || 0), 0);
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

    if (field === 'color') {
      filterSizesByColor(value); // Filter sizes when the color changes
      updatedProducts[index].size = ''; // Reset size when the color changes
    }

    if (field === 'size') {
      const color = updatedProducts[index].color;
      const maxQuantity = getMaxQuantity(color, value);
      console.log(`Max quantity for color: ${color}, size: ${value} is ${maxQuantity}`); // Debugging log
      setMaxQuantities((prev) => ({ ...prev, [`${color}-${value}`]: maxQuantity }));
    }
  };

  const addProduct = () => {
    setNewOrder((prev) => ({
      ...prev,
      productList: [
        ...prev.productList,
        { color: uniqueColors[0] || 'red', size: 30, quantity: 10, isConfirmed: false },
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
    setSelectedCustomer(customer);
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
                    {uniqueColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
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
                    {(filteredSizes[product.color] || []).map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity Field */}
              <div className="product-field-group">
                <label className="input-label">Quantity (Max: {maxQuantities[`${product.color}-${product.size}`] || 0})</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.quantity}</span>
                ) : (
                  <select
                    value={product.quantity}
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    className="input-field"
                  >
                    {[...Array(maxQuantities[`${product.color}-${product.size}`] || 0).keys()].map((q) => (
                      <option key={q + 1} value={q + 1}>
                        {q + 1}
                      </option>
                    ))}
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
