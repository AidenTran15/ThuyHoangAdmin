import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css';
import AddOrderModal from '../AddOrderModal/AddOrderModal'; // Import the new modal component

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newOrder, setNewOrder] = useState({
    orderID: '',
    customer: '',
    productList: [{ color: 'Red', size: 30, quantity: 1 }],
    total: 0,
    totalQuantity: 0,
    status: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateOrderID = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  useEffect(() => {
    axios.get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        console.log(response.data);
        let orderData;
        if (typeof response.data.body === 'string') {
          orderData = JSON.parse(response.data.body);
        } else {
          orderData = response.data.body;
        }
        setOrders(Array.isArray(orderData) ? orderData : []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching the orders!", error);
        setError("Error fetching the orders.");
        setLoading(false);
      });
  }, []);

  const handleAddOrderSaveClick = () => {
    const orderWithID = { ...newOrder, orderID: generateOrderID() };
    axios.post('https://your-api-endpoint.com/orders', orderWithID, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setIsAddingNew(false);
        setOrders(prevOrders => [...prevOrders, orderWithID]);
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

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
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
                  <td>{order.Customer}</td>
                  <td>{order.ProductList ? order.ProductList.join(', ') : 'No products'}</td>
                  <td>{order.Total}</td>
                  <td>{order.TotalQuantity}</td>
                  <td>{order.Status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {isAddingNew && (
        <AddOrderModal 
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          handleAddOrderSaveClick={handleAddOrderSaveClick}
          handleClose={() => setIsAddingNew(false)}
        />
      )}
    </div>
  );
};

export default OrderTable;
