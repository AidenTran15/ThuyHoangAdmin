import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../OrderTable/OrderTable.css'; // Reuse the same styling for consistency

const HistoryOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        let orderData = typeof response.data.body === 'string' 
          ? JSON.parse(response.data.body) 
          : response.data.body;
        
        // Filter the orders by status "Done"
        const doneOrders = orderData.filter(order => order.Status === 'Done');
        setOrders(Array.isArray(doneOrders) ? doneOrders : []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching the orders!", error);
        setError("Error fetching the orders.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="order-table">
      <h2>Order History (Completed Orders)</h2>

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
                  <td>{order.Status}</td>
                  <td>{order.OrderDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No completed orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HistoryOrder;
