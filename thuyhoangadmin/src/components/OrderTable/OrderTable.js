import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css';
import AddOrderModal from '../AddOrderModal/AddOrderModal'; 
import { Link } from 'react-router-dom';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false); // Control modal visibility
  const [filterCustomer, setFilterCustomer] = useState('All'); // State for the selected customer filter

  const [newOrder, setNewOrder] = useState({
    orderID: '',
    customer: '',
    productList: [{ color: 'Red', size: 30, quantity: 1 }],
    total: 0,
    totalQuantity: 0,
    status: ''
  });

  useEffect(() => {
    if (!isAddingNew) {  // Only fetch when not adding a new order
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
    }
  }, [isAddingNew]);  // Depend on isAddingNew so it doesn't reload when adding a new order

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
        setOrders(prevOrders => [...prevOrders, orderWithID]);  // Add new order to the list
        setIsAddingNew(false); // Close the modal after saving
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
          prevOrders
            .map(order =>
              order.orderID === orderID ? { ...order, Status: newStatus } : order
            )
            .filter(order => order.Status !== 'Done') // Remove the order if the status is "Done"
        );
      })
      .catch(error => {
        console.error("Error updating order status:", error);
      });
  };

  // Handle customer filter change
  const handleFilterCustomerChange = (e) => {
    setFilterCustomer(e.target.value);
  };

  // Filtered orders based on selected customer name
  const filteredOrders = filterCustomer === 'All' ? orders : orders.filter(order => order.Customer === filterCustomer);

  // Get unique customer names for the dropdown filter
  const uniqueCustomers = Array.from(new Set(orders.map(order => order.Customer)));

  return (
    <div className="order-table">
      {/* Header section */}
      <div className="header-container">
        <h2>Manage Orders</h2>
        <div className="button-group">
          <button className="add-order-button" onClick={() => setIsAddingNew(true)}>
            Tạo Đơn
          </button>
          <Link to="/history" className="view-history-button">
            Xem Đơn Cũ
          </Link>
        </div>
      </div>

      {/* Filter Dropdown aligned to the right */}
      <div className="filter-container">
        <label htmlFor="customerFilter">Filter by Customer:</label>
        <select
          id="customerFilter"
          value={filterCustomer}
          onChange={handleFilterCustomerChange}
          className="filter-dropdown"
        >
          <option value="All">All</option>
          {uniqueCustomers.map(customer => (
            <option key={customer} value={customer}>
              {customer}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ngày Giờ</th>
              <th>Đơn Hàng ID</th>
              <th>Khách Hàng</th>
              <th>Các Sản Phẩm</th>
              <th>Tổng SL</th>
              <th>Tổng Giá</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.orderID}>
                  <td>{order.OrderDate}</td>
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
                  <td>{order.TotalQuantity}</td>
                  <td>{order.Total}</td>
                  <td>
                    <select
                      value={order.Status}
                      onChange={(e) => handleStatusChange(order.orderID, e.target.value)}
                    >
                      <option value="Pending">Đang xử Lý</option>
                      <option value="Done">Hoàn Thành</option>
                    </select>
                  </td>
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
