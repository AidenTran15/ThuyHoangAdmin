import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css'; // Make sure to include your custom CSS file

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newOrder, setNewOrder] = useState({
    orderID: '',
    customer: '',
    productList: [],
    total: 0,
    totalQuantity: 0,
    status: ''
  });

  // Fetch all orders on component mount
  useEffect(() => {
    axios.get('https://your-api-endpoint.com/orders') // Replace with your actual API endpoint
      .then(response => {
        const orderData = response.data; // Assuming the response is already in JSON format
        setOrders(Array.isArray(orderData) ? orderData : []);
      })
      .catch(error => {
        console.error("Error fetching the orders!", error);
      });
  }, []);

  // Handle input changes for new order details
  const handleNewOrderInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save new order details
  const handleAddOrderSaveClick = () => {
    console.log("Adding new order:", newOrder);
    axios.post('https://your-api-endpoint.com/orders', newOrder, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setIsAddingNew(false); // Close add modal
        setOrders(prevOrders => [...prevOrders, newOrder]);
      })
      .catch(error => {
        console.error("Error adding new order!", error);
      });
  };

  return (
    <div className="order-table">
      <div className="header-container">
        <h2>Manage Orders</h2>
        <button onClick={() => setIsAddingNew(true)} className="add-new-button">Add New Order</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Total</th>
            <th>Total Quantity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map(order => (
              <tr key={order.orderID}>
                <td>{order.orderID}</td>
                <td>{order.customer}</td>
                <td>{order.productList.join(', ')}</td> {/* Display product list as a comma-separated string */}
                <td>{order.total}</td>
                <td>{order.totalQuantity}</td>
                <td>{order.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add New Order Modal */}
      {isAddingNew && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Order</h3>
            <input 
              type="text" 
              name="orderID" 
              placeholder="Order ID" 
              value={newOrder.orderID} 
              onChange={handleNewOrderInputChange} 
            />
            <input 
              type="text" 
              name="customer" 
              placeholder="Customer" 
              value={newOrder.customer} 
              onChange={handleNewOrderInputChange} 
            />
            <input 
              type="text" 
              name="productList" 
              placeholder="Product List (comma separated)" 
              value={newOrder.productList} 
              onChange={(e) => setNewOrder({ ...newOrder, productList: e.target.value.split(',') })}
            />
            <input 
              type="number" 
              name="total" 
              placeholder="Total" 
              value={newOrder.total} 
              onChange={handleNewOrderInputChange} 
            />
            <input 
              type="number" 
              name="totalQuantity" 
              placeholder="Total Quantity" 
              value={newOrder.totalQuantity} 
              onChange={handleNewOrderInputChange} 
            />
            <input 
              type="text" 
              name="status" 
              placeholder="Status" 
              value={newOrder.status} 
              onChange={handleNewOrderInputChange} 
            />
            <button onClick={handleAddOrderSaveClick}>Save</button>
            <button onClick={() => setIsAddingNew(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTable;
