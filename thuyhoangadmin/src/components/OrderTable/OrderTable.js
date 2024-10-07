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
  const [filterStatus, setFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  const ordersPerPage = 10;

  const [newOrder, setNewOrder] = useState({
    orderID: '',
    customer: '',
    productList: [{ color: 'Red', size: 30, quantity: 1 }],
    total: 0,
    totalQuantity: 0,
    status: '',
    note: ''
  });

  useEffect(() => {
    if (!isAddingNew) {
      axios
        .get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
        .then((response) => {
          let orderData = typeof response.data.body === 'string' ? JSON.parse(response.data.body) : response.data.body;
          console.log('API Response on Page Load:', orderData);
          setOrders(Array.isArray(orderData) ? orderData : []);
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
      note: newOrder.note
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
        setOrders((prevOrders) => [...prevOrders, orderWithID]);
        setIsAddingNew(false);
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
        console.log('Status Update Response:', response.data);
        setOrders((prevOrders) =>
          prevOrders.map((order) => 
            order.orderID === orderID ? { ...order, Status: newStatus } : order
          )
        );
      })
      .catch((error) => {
        console.error('Error updating order status:', error);
      });
  };

  const handleFilterCustomerChange = (e) => {
    setFilterCustomer(e.target.value);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleViewNote = (note) => {
    setCurrentNote(note);
    setIsNoteModalVisible(true);
  };

  const filteredOrders = orders
    .filter((order) => (filterCustomer === 'All' ? true : order.Customer === filterCustomer))
    .filter((order) => (filterStatus === 'All' ? (order.Status === 'Pending' || order.Status === 'Preparing') : order.Status === filterStatus));

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const uniqueCustomers = Array.from(new Set(orders.map((order) => order.Customer)));

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
          <button className="add-order-button" onClick={() => setIsAddingNew(true)}>Tạo Đơn</button>
          <Link to="/history" className="view-history-button">Xem Đơn Cũ</Link>
        </div>
      </div>

      <div className="filter-container">
        <label htmlFor="customerFilter">Lọc Đơn Hàng:</label>
        <select id="customerFilter" value={filterCustomer} onChange={handleFilterCustomerChange} className="filter-dropdown">
          <option value="All">Tất cả</option>
          {uniqueCustomers.map((customer) => (
            <option key={customer} value={customer}>{customer}</option>
          ))}
        </select>

        <label htmlFor="statusFilter" style={{ marginLeft: '20px' }}>Trạng Thái:</label>
        <select id="statusFilter" value={filterStatus} onChange={handleFilterStatusChange} className="filter-dropdown">
          <option value="All">Tất cả</option>
          <option value="Pending">Chưa xử Lý</option>
          <option value="Preparing">Đang chuẩn bị</option>
          <option value="Done">Hoàn Thành</option>
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
                <th>Ghi Chú</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.orderID} className={order.Status === 'Pending' ? 'pending-status' : order.Status === 'Preparing' ? 'preparing-status' : ''}>
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
                    <td>{formatCurrencyVND(order.Total)}</td>
                    <td>
                      <button className="view-detail-button" onClick={() => handleViewNote(order.Note)}>Ghi Chú</button>
                    </td>
                    <td>
                      <select value={order.Status} onChange={(e) => handleStatusChange(order.orderID, e.target.value)}>
                        <option value="Pending">Chưa xử Lý</option>
                        <option value="Preparing">Đang chuẩn bị</option>
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

          <div className="pagination-controls" style={{ marginTop: '20px' }}>
            <button onClick={goToPreviousPage} disabled={currentPage === 1} style={{ marginRight: '10px' }}>Trang trước</button>
            <span>Trang {currentPage} trong {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages} style={{ marginLeft: '10px' }}>Trang sau</button>
          </div>
        </>
      )}

      {isAddingNew && (
        <AddOrderModal
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          handleAddOrderSaveClick={handleAddOrderSaveClick}
          handleClose={() => setIsAddingNew(false)}
        />
      )}

      {isNoteModalVisible && (
        <NoteModal note={currentNote} onClose={() => setIsNoteModalVisible(false)} />
      )}
    </div>
  );
};

// Note Modal Component
const NoteModal = ({ note, onClose }) => {
  return (
    <div className="note-modal">
      <div className="note-modal-content">
        <h3>Ghi Chú</h3>
        <p>{note || 'Không có ghi chú'}</p>
        <button onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
};

export default OrderTable;
