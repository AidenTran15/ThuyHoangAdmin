import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../OrderTable/OrderTable'; // Reuse the same styling for consistency

const HistoryOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState('');
  const [confirmationInput, setConfirmationInput] = useState('');

  // Function to handle the deletion of an order by orderID
  const handleDeleteOrder = (orderID) => {
    setOrderToDelete(orderID);
    setIsDeleteConfirmationVisible(true); // Show confirmation modal
  };

  // Confirm and delete the order if user inputs "Đồng Ý"
  const confirmDeleteOrder = () => {
    if (confirmationInput === 'Đồng Ý') {
      const requestBody = { orderID: orderToDelete };
      
      axios({
        method: 'DELETE',
        url: 'https://l9zec35au3.execute-api.ap-southeast-2.amazonaws.com/prod/delete',
        data: requestBody,
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => {
        console.log(`Order ${orderToDelete} deleted successfully`);

        // Remove the deleted order from the orders list
        setOrders(prevOrders => prevOrders.filter(order => order.orderID !== orderToDelete));
        setOrderToDelete(''); // Reset the order to delete
        setConfirmationInput(''); // Reset confirmation input
        setIsDeleteConfirmationVisible(false); // Hide confirmation modal
      })
      .catch(error => {
        console.error("Error deleting order:", error);
      });
    } else {
      alert('Please type "Đồng Ý" to confirm deletion.');
    }
  };

  useEffect(() => {
    axios.get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        let orderData = typeof response.data.body === 'string' 
          ? JSON.parse(response.data.body) 
          : response.data.body;
        
        // Filter orders with status 'Done'
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
      <h2>Lịch Sử Đơn Hàng (Đơn Hàng Đã Hoàn Thành)</h2>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ngày Giờ</th>
              <th>Mã Đơn Hàng</th>
              <th>Khách Hàng</th>
              <th>Sản Phẩm</th>
              <th>Tổng SL</th>
              <th>Tổng Giá</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
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
                  <td>{order.Status}</td>
                  <td>
                    <button onClick={() => handleDeleteOrder(order.orderID)} style={{ backgroundColor: 'red', color: 'white' }}>Xóa Đơn</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No completed orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmationVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác Nhận Xóa Đơn Hàng</h3>
            <p>Vui lòng nhập "Đồng Ý" để xóa đơn hàng này:</p>
            <input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder='Nhập "Đồng Ý"'
            />
            <div className="modal-buttons">
              <button onClick={confirmDeleteOrder}>Xóa</button>
              <button onClick={() => setIsDeleteConfirmationVisible(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryOrder;
