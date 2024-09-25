import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css';
import AddOrderModal from '../AddOrderModal/AddOrderModal';

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
    const orderWithID = { 
      orderID: generateOrderID(), 
      customer_name: newOrder.customer,  // Adjust field names to match the expected body in Lambda
      product_list: newOrder.productList.map((product, index) => ({
        product_id: `P00${index + 1}`,  // Example product_id generation
        color: product.color,
        size: product.size,
        quantity: product.quantity
      })),
      total_quantity: newOrder.totalQuantity, 
      total_amount: newOrder.total, 
      status: 'Pending',
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16)  // Format with only date and time (HH:MM)
    };
  
    // Stringify the order data and wrap it in a "body" field
    const requestBody = JSON.stringify({
      body: JSON.stringify(orderWithID)
    });
  
    console.log("Formatted order data being sent:", requestBody); // Log the formatted request body
  
    axios.post('https://n73lcvb962.execute-api.ap-southeast-2.amazonaws.com/prod/add', requestBody, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        console.log("API Response:", response.data); // Log the API response for debugging
        setIsAddingNew(false);
        setOrders(prevOrders => [...prevOrders, orderWithID]);
      })
      .catch(error => {
        console.error("Error adding new order:", error.response ? error.response.data : error.message);  // Log any error messages from the API
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
              <th>Order Date</th> {/* Add Order Date with Time column */}
            </tr>
          </thead>
          <tbody>
  {orders.length > 0 ? (
    orders.map(order => (
      <tr key={order.orderID}>
        <td>{order.orderID}</td>
        <td>{order.Customer}</td>
        <td>
          {order.ProductList
            ? order.ProductList.map(product => 
                `${product.color} ${product.size} - ${product.quantity}`).join(', ')
            : 'No products'}
        </td>
        <td>{order.Total}</td>
        <td>{order.TotalQuantity}</td>
        <td>{order.Status}</td>
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
