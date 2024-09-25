import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css';
import AddOrderModal from '../AddOrderModal/AddOrderModal'; // Import the modal component

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false); // Control modal visibility
  const [newOrder, setNewOrder] = useState({
    orderID: '',
    customer: '',
    productList: [{ color: 'Red', size: 30, quantity: 1 }],
    total: 0,
    totalQuantity: 0,
    status: ''
  });

  useEffect(() => {
    axios.get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        let orderData = typeof response.data.body === 'string' 
          ? JSON.parse(response.data.body) 
          : response.data.body;
        
        const pendingOrders = orderData.filter(order => order.Status === 'Pending');
        setOrders(Array.isArray(pendingOrders) ? pendingOrders : []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching the orders!", error);
        setError("Error fetching the orders.");
        setLoading(false);
      });
  }, []);

  // Helper function to generate order IDs
  const generateOrderID = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  // Function for saving new order when "Save" button in modal is clicked
  const handleAddOrderSaveClick = () => {
    const orderWithID = { 
      orderID: generateOrderID(), 
      customer_name: newOrder.customer,
      product_list: newOrder.productList.map((product, index) => ({
        product_id: `P00${index + 1}`,
        color: product.color,
        size: product.size,
        quantity: product.quantity
      })),
      total_quantity: newOrder.totalQuantity, 
      total_amount: newOrder.total, 
      status: 'Pending',
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
  
    const requestBody = JSON.stringify({
      body: JSON.stringify(orderWithID)
    });
  
    console.log("Formatted order data being sent:", requestBody);
  
    axios.post('https://n73lcvb962.execute-api.ap-southeast-2.amazonaws.com/prod/add', requestBody, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        console.log("API Response:", response.data);
        setIsAddingNew(false); // Close the modal after saving
        setOrders(prevOrders => [...prevOrders, orderWithID]);
      })
      .catch(error => {
        console.error("Error adding new order:", error.response ? error.response.data : error.message);
      });
  };

  // Function for handling the status change from 'Pending' to 'Done'
  const handleStatusChange = (orderID, newStatus) => {
    const requestBody = {
      orderID: orderID,
      status: newStatus
    };
  
    axios.put('https://bk77c3sxtk.execute-api.ap-southeast-2.amazonaws.com/prod/updatestatus', requestBody)
      .then(response => {
        setOrders(prevOrders =>
          prevOrders.map(order => 
            order.orderID === orderID ? { ...order, Status: newStatus } : order
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

      {/* Add Order Button */}
      <button className="add-order-button" onClick={() => setIsAddingNew(true)}>
        Add New Order
      </button>

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
                    <select
                      value={order.Status}
                      onChange={(e) => handleStatusChange(order.orderID, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                    </select>
                  </td>
                  <td>{order.OrderDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No pending orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* AddOrderModal will be shown conditionally */}
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
