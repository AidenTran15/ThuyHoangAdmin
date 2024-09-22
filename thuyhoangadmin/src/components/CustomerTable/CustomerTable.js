import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CustomerTable.css';  // Make sure you link the CSS

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [updatedCustomer, setUpdatedCustomer] = useState({});
  const [newCustomer, setNewCustomer] = useState({});  // For adding a new customer
  const [isAddingNew, setIsAddingNew] = useState(false); // Toggle for the add new modal

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
    setUpdatedCustomer(customer); // Set the selected customer to be edited
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCustomer({
      ...updatedCustomer,
      [name]: value
    });
  };

  const handleSaveClick = () => {
    axios.put('https://3dm9uksgnf.execute-api.ap-southeast-2.amazonaws.com/prod/update', updatedCustomer)
      .then(() => {
        setEditingCustomer(null);
        setCustomers((prevCustomers) => prevCustomers.map(c => 
          c['phone_number'] === updatedCustomer['phone_number'] ? updatedCustomer : c
        ));
      })
      .catch(error => {
        console.error("Error updating the customer!", error);
      });
  };

  const handleDeleteClick = (phone_number) => {
    axios.delete('https://htjd8snvtc.execute-api.ap-southeast-2.amazonaws.com/prod/delete', {
      data: { phone_number }
    })
      .then(() => {
        setCustomers(prevCustomers => prevCustomers.filter(c => c['phone_number'] !== phone_number));
      })
      .catch(error => {
        console.error("Error deleting the customer!", error);
      });
  };

  // Handle new customer addition
  const handleNewCustomerInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value
    });
  };

  const handleAddNewCustomerClick = () => {
    setIsAddingNew(true); // Show the modal to add new customer
  };

  const handleAddCustomerSaveClick = () => {
    axios.post('https://52s91z2sse.execute-api.ap-southeast-2.amazonaws.com/prod/add', newCustomer)
      .then(() => {
        setIsAddingNew(false);
        setCustomers(prevCustomers => [...prevCustomers, newCustomer]); // Add new customer to the table
      })
      .catch(error => {
        console.error("Error adding new customer!", error);
      });
  };

  return (
    <div className="customer-table">
      <h2>Manage Customers</h2>
      <button onClick={handleAddNewCustomerClick} className="add-new-button">Add New Customer</button>
      
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
          <h3>Add New Customer</h3>
          <input type="text" name="name" placeholder="Name" onChange={handleNewCustomerInputChange} />
          <input type="text" name="phone_number" placeholder="Phone Number" onChange={handleNewCustomerInputChange} />
          <input type="text" name="address" placeholder="Address" onChange={handleNewCustomerInputChange} />
          <input type="number" name="short_price" placeholder="Pant Price" onChange={handleNewCustomerInputChange} />
          <input type="number" name="dress_price" placeholder="Shirt Price" onChange={handleNewCustomerInputChange} />
          <button onClick={handleAddCustomerSaveClick}>Save</button>
        </div>
      )}
    </div>
  );
};

export default CustomerTable;
