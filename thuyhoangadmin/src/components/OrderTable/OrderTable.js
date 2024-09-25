import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        let orderData = typeof response.data.body === 'string' 
          ? JSON.parse(response.data.body) 
          : response.data.body;
        setOrders(Array.isArray(orderData) ? orderData : []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching the orders!", error);
        setError("Error fetching the orders.");
        setLoading(false);
      });
  }, []);

  const handleStatusChange = (orderID) => {
    const requestBody = {
      orderID: orderID
    };
  
    console.log('Request body being sent:', requestBody);  // Log the body for debugging
  
    axios.put('https://bk77c3sxtk.execute-api.ap-southeast-2.amazonaws.com/prod/updatestatus', requestBody)
      .then(response => {
        setOrders(prevOrders =>
          prevOrders.map(order => 
            order.orderID === orderID ? { ...order, Status: 'Done' } : order
          )
        );
      })
      .catch(error => {
        console.error("Error updating order status:", error);
      });
  };
  

  return (
    <div className="order-table">
      <h2>Manage Orders</h2>

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
              <th>Order Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr key={order.orderID}>
                  <td>{order.orderID}</td>
                  <td>{order.Customer}</td>
                  <td>
                    <ul style={{ paddingLeft: '0', margin: '0', listStyleType: 'none' }}>
                      {order.ProductList ? (
                        order.ProductList.map((product, index) => (
                          <li key={index}>
                            {`${product.color} ${product.size} - ${product.quantity}`}
                          </li>
                        ))
                      ) : 'No products'}
                    </ul>
                  </td>
                  <td>{order.Total}</td>
                  <td>{order.TotalQuantity}</td>
                  <td>
                    {order.Status === 'Pending' ? (
                      <select
                        value={order.Status}
                        onChange={() => handleStatusChange(order.orderID)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Done">Done</option>
                      </select>
                    ) : (
                      order.Status
                    )}
                  </td>
                  <td>{order.OrderDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderTable;
