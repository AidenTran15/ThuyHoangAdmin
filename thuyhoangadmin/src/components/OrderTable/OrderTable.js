// OrderTable.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderTable.css';
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
    customer: '',
    productList: [{ color: '', size: '', quantity: '', isConfirmed: false }],
    totalQuantity: 0,
    total: '',
    note: '',
  });

  // New state variables for the product form
  const [uniqueColors, setUniqueColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [productIDs, setProductIDs] = useState({});
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isAddingNew) {
      axios
        .get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
        .then((response) => {
          let orderData = typeof response.data.body === 'string' ? JSON.parse(response.data.body) : response.data.body;
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

  // Fetch product data when modal opens
  useEffect(() => {
    if (isAddingNew) {
      // Fetch product data from API
      axios
        .get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
        .then((response) => {
          const productData = JSON.parse(response.data.body);
          setProducts(productData);

          const sortedColors = [...new Set(productData.map((product) => product.Color))].sort((a, b) => {
            const aValue = parseInt(a.match(/\d+/)); // Extract the number from the string
            const bValue = parseInt(b.match(/\d+/)); // Extract the number from the string
            return aValue - bValue;
          });

          setUniqueColors(sortedColors);
        })
        .catch((error) => console.error('Error fetching product list:', error));
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
        product_id: productIDs[`${product.color}-${product.size}`] || `P00${index + 1}`,
        color: product.color,
        size: product.size,
        quantity: product.quantity,
      })),
      total_quantity: newOrder.totalQuantity,
      total_amount: newOrder.total,
      status: 'Pending',
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      note: note,
    };

    const requestBody = JSON.stringify({
      body: JSON.stringify(orderWithID),
    });

    axios
      .post('https://n73lcvb962.execute-api.ap-southeast-2.amazonaws.com/prod/add', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        setOrders((prevOrders) => [...prevOrders, orderWithID]);
        alert('Order saved successfully!');
        setIsAddingNew(false); // Close the modal after saving
      })
      .catch((error) => {
        console.error('Error adding new order:', error.response ? error.response.data : error.message);
        alert('Error saving order, please try again.');
      });
  };

  const handleStatusChange = (orderID, newStatus) => {
    const requestBody = {
      orderID: orderID,
      status: newStatus,
    };

    axios
      .put('https://bk77c3sxtk.execute-api.ap-southeast-2.amazonaws.com/prod/updatestatus', requestBody)
      .then((response) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) => (order.orderID === orderID ? { ...order, Status: newStatus } : order))
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

  // Function to handle copying the order details in Vietnamese format
  const handleCopyOrder = (order) => {
    const orderDetails = `Khách Hàng: ${order.Customer}\nSản Phẩm:\n${order.ProductList.map(
      (product) => `- Màu: ${product.color}, Kích cỡ: ${product.size}, Số Lượng: ${product.quantity}`
    ).join('\n')}\nTổng Số Lượng: ${order.TotalQuantity}\nGhi Chú: ${order.Note || 'Không có ghi chú'}`;

    // Check if Clipboard API is supported
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(orderDetails)
        .then(() => {
          alert('Thông tin đơn hàng đã được sao chép!');
        })
        .catch((error) => {
          console.error('Lỗi khi sao chép thông tin đơn hàng:', error);
          alert('Lỗi khi sao chép thông tin đơn hàng, vui lòng thử lại.');
        });
    } else {
      // Fallback option for browsers that do not support Clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = orderDetails;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Thông tin đơn hàng đã được sao chép!');
      } catch (err) {
        console.error('Lỗi khi sao chép thông tin đơn hàng:', err);
        alert('Lỗi khi sao chép thông tin đơn hàng, vui lòng thử lại.');
      }
      document.body.removeChild(textArea);
    }
  };

  const filteredOrders = orders
    .filter((order) => (filterCustomer === 'All' ? true : order.Customer === filterCustomer))
    .filter((order) =>
      filterStatus === 'All' ? order.Status === 'Pending' || order.Status === 'Preparing' : order.Status === filterStatus
    );

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

  // Handlers for the product form
  const getMaxQuantityAndProductID = (color, size) => {
    if (!color || !size) return 0;

    const product = products.find(
      (product) => product.Color === color && product.Size?.toString() === size?.toString()
    );
    if (product) {
      setProductIDs((prev) => ({ ...prev, [`${color}-${size}`]: product.ProductID }));
      return product.Quantity;
    }
    return 0;
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index][field] = value;
    setNewOrder({ ...newOrder, productList: updatedProducts });

    if (field === 'color') {
      updatedProducts[index].size = ''; // Reset size when color changes
    }

    if (field === 'size') {
      const color = updatedProducts[index].color;
      const maxQuantity = getMaxQuantityAndProductID(color, value);
      setMaxQuantities((prev) => ({ ...prev, [`${color}-${value}`]: maxQuantity }));
    }
  };

  const addProduct = () => {
    setNewOrder((prev) => ({
      ...prev,
      productList: [...prev.productList, { color: '', size: '', quantity: '', isConfirmed: false }],
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

  // Update total quantity when product list changes
  useEffect(() => {
    const totalQuantity = newOrder.productList.reduce((total, product) => total + parseInt(product.quantity || 0), 0);

    if (newOrder.totalQuantity !== totalQuantity) {
      setNewOrder((prev) => ({
        ...prev,
        totalQuantity,
        // Remove total amount update to allow user input
        // total: totalAmount,
      }));
    }
  }, [newOrder.productList, newOrder.totalQuantity]);

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
        <select
          id="customerFilter"
          value={filterCustomer}
          onChange={handleFilterCustomerChange}
          className="filter-dropdown"
        >
          <option value="All">Tất cả</option>
          {uniqueCustomers.map((customer) => (
            <option key={customer} value={customer}>
              {customer}
            </option>
          ))}
        </select>

        <label htmlFor="statusFilter" style={{ marginLeft: '20px' }}>
          Trạng Thái:
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={handleFilterStatusChange}
          className="filter-dropdown"
        >
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
                <th>Note</th>
                <th>Copy</th>
                <th>Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr
                    key={order.orderID}
                    className={
                      order.Status === 'Pending' ? 'pending-status' : order.Status === 'Preparing' ? 'preparing-status' : ''
                    }
                  >
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
                      <button className="view-detail-button" onClick={() => handleViewNote(order.Note)}>
                        Note
                      </button>
                    </td>
                    <td>
                      <button className="copy-button" onClick={() => handleCopyOrder(order)}>
                        Copy
                      </button>
                    </td>
                    <td>
                      <select
                        className="status-dropdown"
                        value={order.Status}
                        onChange={(e) => handleStatusChange(order.orderID, e.target.value)}
                      >
                        <option value="Pending">Chưa xử Lý</option>
                        <option value="Preparing">Đang chuẩn bị</option>
                        <option value="Done">Hoàn Thành</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">Không tìm thấy đơn hàng</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-controls" style={{ marginTop: '20px' }}>
            <button onClick={goToPreviousPage} disabled={currentPage === 1} style={{ marginRight: '10px' }}>
              Trang trước
            </button>
            <span>
              Trang {currentPage} trong {totalPages}
            </span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages} style={{ marginLeft: '10px' }}>
              Trang sau
            </button>
          </div>
        </>
      )}

      {/* Updated Add New Order Modal */}
      {isAddingNew && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-title">Tạo Đơn Hàng Mới</h3>
            <div className="input-group">
              <label className="input-label">Tên Khách Hàng</label>
              {/* Changed input to select dropdown */}
              <select
                value={newOrder.customer}
                onChange={(e) => setNewOrder({ ...newOrder, customer: e.target.value })}
                className="input-field"
              >
                <option value="">Chọn Khách Hàng</option>
                {uniqueCustomers.map((customer) => (
                  <option key={customer} value={customer}>
                    {customer}
                  </option>
                ))}
              </select>
            </div>

            {newOrder.productList.map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-row">
                  <div className="product-field-group">
                    <label className="input-label">Màu Sắc</label>
                    {product.isConfirmed ? (
                      <span className="locked-field">{product.color}</span>
                    ) : (
                      <select
                        value={product.color}
                        onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                        className="input-field color-input"
                      >
                        <option value="">Chọn Màu Sắc</option>
                        {uniqueColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="product-field-group">
                    <label className="input-label">Kích Cỡ</label>
                    {product.isConfirmed ? (
                      <span className="locked-field">{product.size}</span>
                    ) : (
                      <input
                        type="text"
                        value={product.size || ''}
                        onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                        className="input-field size-input"
                        placeholder="Nhập Kích Cỡ"
                      />
                    )}
                  </div>

                  <div className="product-field-group">
                    <label className="input-label">Số Lượng</label>
                    {product.isConfirmed ? (
                      <span className="locked-field">{product.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        min="1"
                        max={maxQuantities[`${product.color}-${product.size}`] || 0}
                        value={product.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        className="input-field quantity-input"
                      />
                    )}
                  </div>

                  {!product.isConfirmed ? (
                    <button className="add-button" onClick={() => confirmProduct(index)}>
                      Thêm
                    </button>
                  ) : (
                    <button className="remove-product-button" onClick={() => removeProduct(index)}>
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}

            {newOrder.productList.some((product) => product.isConfirmed) && (
              <button className="add-product-button" onClick={addProduct}>
                Thêm Sản Phẩm
              </button>
            )}

            <div className="input-group">
              <label className="input-label">Tổng Số Lượng</label>
              <input type="number" name="totalQuantity" value={newOrder.totalQuantity} readOnly className="input-field" />
            </div>

            <div className="input-group">
              <label className="input-label">Tổng Số Tiền</label>
              {/* Made input field editable */}
              <input
                type="text"
                name="total"
                value={newOrder.total}
                onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
                className="input-field"
                placeholder="Nhập Tổng Số Tiền"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Ghi Chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="input-field note-input"
                placeholder="Thêm ghi chú cho đơn hàng..."
              />
            </div>

            <div className="modal-footer">
              <button className="save-button" onClick={handleAddOrderSaveClick}>
                Lưu
              </button>
              <button className="cancel-button" onClick={() => setIsAddingNew(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {isNoteModalVisible && <NoteModal note={currentNote} onClose={() => setIsNoteModalVisible(false)} />}
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
