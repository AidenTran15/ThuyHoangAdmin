import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css';
import AddOrderModal from '../AddOrderModal/AddOrderModal';
import { Link } from 'react-router-dom';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState('All');
  const [currentPage, setCurrentPage] = useState(1); // New state for current page
  const ordersPerPage = 10; // Set the number of orders displayed per page

  const [newOrder, setNewOrder] = useState({
    orderID: '',
    customer: '',
    productList: [{ color: 'Red', size: 30, quantity: 1 }],
    total: 0,
    totalQuantity: 0,
    status: '',
    note: '' // Include note in the state
  });

  useEffect(() => {
    if (!isAddingNew) {
      axios
        .get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
        .then((response) => {
          let orderData = typeof response.data.body === 'string' ? JSON.parse(response.data.body) : response.data.body;
          const pendingOrders = orderData.filter((order) => order.Status === 'Pending');
          setOrders(Array.isArray(pendingOrders) ? pendingOrders : []);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching the orders!', error);
          setError('Error fetching the orders.');
          setLoading(false);
        });
    }
  }, [isAddingNew]);

  const generateOrderID = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  // Function to format currency in VND format
  const formatCurrencyVND = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

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
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: newOrder.note // Include the note field
    };

    const requestBody = JSON.stringify({
      body: JSON.stringify(orderWithID)
    });

    axios
      .post('https://n73lcvb962.execute-api.ap-southeast-2.amazonaws.com/prod/add', requestBody, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((response) => {
        console.log('API Response:', response.data);
        setOrders((prevOrders) => [...prevOrders, orderWithID]); // Add new order to the list
        setIsAddingNew(false); // Close the modal after saving
      })
      .catch((error) => {
        console.error('Error adding new order:', error.response ? error.response.data : error.message);
      });
  };

  const handleStatusChange = (orderID, newStatus) => {
    const requestBody = {
      orderID: orderID,
      status: newStatus
    };

    axios
      .put('https://bk77c3sxtk.execute-api.ap-southeast-2.amazonaws.com/prod/updatestatus', requestBody)
      .then((response) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.orderID === orderID ? { ...order, Status: newStatus } : order)).filter((order) => order.Status !== 'Done')
        );
      })
      .catch((error) => {
        console.error('Error updating order status:', error);
      });
  };

  const handleFilterCustomerChange = (e) => {
    setFilterCustomer(e.target.value);
  };

  const filteredOrders = filterCustomer === 'All' ? orders : orders.filter((order) => order.Customer === filterCustomer);

  // Calculate total pages and get orders for current page
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const uniqueCustomers = Array.from(new Set(orders.map((order) => order.Customer)));

  // Handle page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="order-table">
      <div className="header-container">
        <h2>Quản Lý Đơn Hàng</h2>
        <div className="button-group">
          <button className="add-order-button" onClick={() => setIsAddingNew(true)}>
            Tạo Đơn
          </button>
          <Link to="/history" className="view-history-button">
            Xem Đơn Cũ
          </Link>
        </div>
      </div>

      <div className="filter-container">
        <label htmlFor="customerFilter">Lọc Đơn Hàng:</label>
        <select id="customerFilter" value={filterCustomer} onChange={handleFilterCustomerChange} className="filter-dropdown">
          <option value="All">Tất cả</option>
          {uniqueCustomers.map((customer) => (
            <option key={customer} value={customer}>
              {customer}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Đang tải đơn hàng...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Ngày Giờ</th>
                <th>ID</th>
                <th>Khách Hàng</th>
                <th>Các Sản Phẩm Đơn Hàng</th>
                <th>Tổng SL</th>
                <th>Tổng Giá</th>
                <th>Ghi Chú</th> {/* Add new column for Note */}
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.orderID}>
                    <td>{order.OrderDate}</td>
                    <td>{order.orderID}</td>
                    <td>{order.Customer}</td>
                    <td>
                      <ul style={{ paddingLeft: '0', margin: '0', listStyleType: 'none' }}>
                        {order.ProductList ? (
                          order.ProductList.map((product, index) => (
                            <li key={index}>{`${product.color} ${product.size} - ${product.quantity}`}</li>
                          ))
                        ) : (
                          'No products'
                        )}
                      </ul>
                    </td>
                    <td>{order.TotalQuantity}</td>
                    <td>{formatCurrencyVND(order.Total)}</td> {/* Format Tổng Giá to VND */}
                    <td>{order.Note || 'Không có ghi chú'}</td> {/* Display note value */}
                    <td>
                      <select value={order.Status} onChange={(e) => handleStatusChange(order.orderID, e.target.value)}>
                        <option value="Pending">Đang xử Lý</option>
                        <option value="Done">Hoàn Thành</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">Không tìm thấy đơn hàng</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination-controls" style={{ marginTop: '20px' }}>
            <button onClick={goToPreviousPage} disabled={currentPage === 1} style={{ marginRight: '10px' }}>
              Trang trước
            </button>
            <span>Trang {currentPage} trong {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages} style={{ marginLeft: '10px' }}>
              Trang sau
            </button>
          </div>
        </>
      )}

      {isAddingNew && (
        <AddOrderModal newOrder={newOrder} setNewOrder={setNewOrder} handleAddOrderSaveClick={handleAddOrderSaveClick} handleClose={() => setIsAddingNew(false)} />
      )}
    </div>
  );
};

export default OrderTable;
