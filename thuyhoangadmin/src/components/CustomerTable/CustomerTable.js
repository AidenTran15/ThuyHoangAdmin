import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CustomerTable.css'; // Ensure this file contains the updated CSS

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [updatedCustomer, setUpdatedCustomer] = useState({});
  const [newCustomer, setNewCustomer] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isDeleteConfirmation, setIsDeleteConfirmation] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState('');
  const [confirmationInput, setConfirmationInput] = useState(''); // State for confirmation input

  // Fetch all customers on component mount
  useEffect(() => {
    axios.get('https://twnbtj6wuc.execute-api.ap-southeast-2.amazonaws.com/prod/customers')
      .then(response => {
        const customerData = JSON.parse(response.data.body);
        setCustomers(Array.isArray(customerData) ? customerData : []);
      })
      .catch(error => {
        console.error("Error fetching the customers!", error);
      });
  }, []);

  // Set the customer for editing and pre-fill their details in the form
  const handleEditClick = (customer) => {
    setEditingCustomer(customer['phone_number']);
    setUpdatedCustomer(customer);
  };

  // Handle input changes for updated customer details
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCustomer(prev => ({ ...prev, [name]: value }));
  };

  // Save updated customer details
  const handleSaveClick = () => {
    console.log("Updating customer:", updatedCustomer);
    const requestBody = { body: JSON.stringify(updatedCustomer) }; // Format the request body

    axios.put('https://3dm9uksgnf.execute-api.ap-southeast-2.amazonaws.com/prod/update', requestBody, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setEditingCustomer(null); // Exit editing mode
        setCustomers(prevCustomers => prevCustomers.map(c =>
          c['phone_number'] === updatedCustomer['phone_number'] ? updatedCustomer : c
        ));
      })
      .catch(error => {
        console.error("Error updating the customer!", error);
      });
  };

  // Handle input for adding new customer details
  const handleNewCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  // Open modal for adding a new customer
  const handleAddNewCustomerClick = () => {
    setIsAddingNew(true);
  };

  // Save new customer details
  const handleAddCustomerSaveClick = () => {
    console.log("Adding new customer:", newCustomer);
    const requestBody = { body: JSON.stringify(newCustomer) }; // Format the request body

    axios.post('https://52s91z2sse.execute-api.ap-southeast-2.amazonaws.com/prod/add', requestBody, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setIsAddingNew(false); // Close add modal
        setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      })
      .catch(error => {
        console.error("Error adding new customer!", error);
      });
  };

  // Handle delete customer action
  const handleDeleteClick = (phone_number) => {
    setCustomerToDelete(phone_number);
    setIsDeleteConfirmation(true); // Show delete confirmation modal
  };

  // Confirm and delete customer
  const confirmDelete = () => {
    if (confirmationInput === "Đồng Ý") {
      const requestBody = { body: JSON.stringify({ phone_number: customerToDelete }) }; // Format the request body

      axios.delete('https://htjd8snvtc.execute-api.ap-southeast-2.amazonaws.com/prod/delete', {
        data: requestBody,
        headers: { 'Content-Type': 'application/json' }
      })
        .then(() => {
          setCustomers(prevCustomers => prevCustomers.filter(c => c['phone_number'] !== customerToDelete));
          setCustomerToDelete('');
          setConfirmationInput(''); // Reset confirmation input
        })
        .catch(error => {
          console.error("Error deleting the customer!", error);
        });
    }
    setIsDeleteConfirmation(false); // Close delete confirmation modal
  };

  return (
    <div className="customer-table">
      <div className="header-container">
        <h2>Quản Lý Khách Hàng</h2>
        <button onClick={handleAddNewCustomerClick} className="add-new-button">Tạo Mới</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Số Điện Thoại</th>
            <th>Địa Chỉ</th>
            <th>Giá Bán</th>
            <th>Mật Khẩu</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map(customer => (
              <tr key={customer['phone_number']}>
                <td>
                  {editingCustomer === customer['phone_number'] ? (
                    <input
                      type="text"
                      name="name"
                      value={updatedCustomer.name || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    customer.name
                  )}
                </td>
                <td>{customer['phone_number']}</td>
                <td>
                  {editingCustomer === customer['phone_number'] ? (
                    <input
                      type="text"
                      name="address"
                      value={updatedCustomer.address || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    customer.address
                  )}
                </td>
                <td>
                  {editingCustomer === customer['phone_number'] ? (
                    <input
                      type="number"
                      name="short_price"
                      value={updatedCustomer.short_price || 0}
                      onChange={handleInputChange}
                    />
                  ) : (
                    customer.short_price
                  )}
                </td>
                <td>
                  {editingCustomer === customer['phone_number'] ? (
                    <input
                      type="password"
                      name="password"
                      value={updatedCustomer.password || ''}
                      onChange={handleInputChange}
                    />
                  ) : (
                    customer.password
                  )}
                </td>
                <td>
                  {editingCustomer === customer['phone_number'] ? (
                    <button onClick={handleSaveClick}>Save</button>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(customer)}>Chỉnh</button>
                      <button
                        onClick={() => handleDeleteClick(customer['phone_number'])}
                        style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No customers found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add New Customer Modal */}
      {isAddingNew && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm Khách Hàng Mới</h3>
            <input type="text" name="name" placeholder="Tên Khách Hàng" onChange={handleNewCustomerInputChange} />
            <input type="text" name="phone_number" placeholder="Số Điện Thoại" onChange={handleNewCustomerInputChange} />
            <input type="text" name="address" placeholder="Địa Chỉ" onChange={handleNewCustomerInputChange} />
            <input type="number" name="short_price" placeholder="Giá Bán" onChange={handleNewCustomerInputChange} />
            <input type="password" name="password" placeholder="Mật Khẩu" onChange={handleNewCustomerInputChange} />
            <button onClick={handleAddCustomerSaveClick}>Lưu</button>
            <button onClick={() => setIsAddingNew(false)}>Hủy Bỏ</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác Nhận Xóa Đơn Hàng</h3>
            <p>Vui lòng nhập "Đồng Ý" để xóa đơn hàng này:</p>
            <input
              type="text"
              onChange={(e) => setConfirmationInput(e.target.value)}
            />
            <button onClick={confirmDelete}>Xóa</button>
            <button onClick={() => setIsDeleteConfirmation(false)}>Hủy Bỏ</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
