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

  const handleEditClick = (customer) => {
    setEditingCustomer(customer['phone_number']);
    setUpdatedCustomer(customer);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    axios.put('https://3dm9uksgnf.execute-api.ap-southeast-2.amazonaws.com/prod/update', updatedCustomer)
      .then(() => {
        setEditingCustomer(null);
        setCustomers(prevCustomers => prevCustomers.map(c =>
          c['phone_number'] === updatedCustomer['phone_number'] ? updatedCustomer : c
        ));
      })
      .catch(error => {
        console.error("Error updating the customer!", error);
      });
  };

  const handleNewCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewCustomerClick = () => {
    setIsAddingNew(true);
  };

  const handleAddCustomerSaveClick = () => {
    axios.post('https://52s91z2sse.execute-api.ap-southeast-2.amazonaws.com/prod/add', newCustomer)
      .then(() => {
        setIsAddingNew(false);
        setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      })
      .catch(error => {
        console.error("Error adding new customer!", error);
      });
  };

  const handleDeleteClick = (phone_number) => {
    setCustomerToDelete(phone_number);
    setIsDeleteConfirmation(true); // Show delete confirmation modal
  };

  const confirmDelete = () => {
    if (confirmationInput === "Confirm") {
      axios.delete('https://htjd8snvtc.execute-api.ap-southeast-2.amazonaws.com/prod/delete', {
        data: { phone_number: customerToDelete }
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
    setIsDeleteConfirmation(false); // Close confirmation modal
  };

  return (
    <div className="customer-table">
  <div className="header-container">
    <h2>Manage Customers</h2>
    <button onClick={handleAddNewCustomerClick} className="add-new-button">Add New</button>
  </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Address</th>
            <th>Pant Price</th>
            <th>Shirt Price</th>
            <th>Actions</th>
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
                      value={updatedCustomer.name}
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
                      value={updatedCustomer.address}
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
                      value={updatedCustomer.short_price}
                      onChange={handleInputChange}
                    />
                  ) : (
                    customer.short_price
                  )}
                </td>
                <td>
                  {editingCustomer === customer['phone_number'] ? (
                    <input
                      type="number"
                      name="dress_price"
                      value={updatedCustomer.dress_price}
                      onChange={handleInputChange}
                    />
                  ) : (
                    customer.dress_price
                  )}
                </td>
                <td>
                  {editingCustomer === customer['phone_number'] ? (
                    <button onClick={handleSaveClick}>Save</button>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(customer)}>Edit</button>
                      <button 
                        onClick={() => handleDeleteClick(customer['phone_number'])} 
                        style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}
                      >
                        Delete
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
            <h3>Add New Customer</h3>
            <input type="text" name="name" placeholder="Name" onChange={handleNewCustomerInputChange} />
            <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleNewCustomerInputChange} />
            <input type="text" name="address" placeholder="Address" onChange={handleNewCustomerInputChange} />
            <input type="number" name="short_price" placeholder="Pant Price" onChange={handleNewCustomerInputChange} />
            <input type="number" name="dress_price" placeholder="Shirt Price" onChange={handleNewCustomerInputChange} />
            <button onClick={handleAddCustomerSaveClick}>Save</button>
            <button onClick={() => setIsAddingNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmation && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Type "Confirm" to delete this customer:</p>
            <input 
              type="text" 
              onChange={(e) => setConfirmationInput(e.target.value)} 
            />
            <button onClick={confirmDelete}>Delete</button>
            <button onClick={() => setIsDeleteConfirmation(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
