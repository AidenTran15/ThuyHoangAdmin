import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CustomerTable.css';  // Ensure you have the relevant CSS

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [updatedCustomer, setUpdatedCustomer] = useState({});

  // Fetch the customer data when the component mounts
  useEffect(() => {
    axios.get('https://twnbtj6wuc.execute-api.ap-southeast-2.amazonaws.com/prod/customers', {
      headers: {
        'x-api-key': 'YOUR_API_KEY' // Add your API key here if required
      }
    })
    .then(response => {
      // Parse the response body as a JSON array
      const customerData = JSON.parse(response.data.body);
      setCustomers(Array.isArray(customerData) ? customerData : []);
    })
    .catch(error => {
      console.error("Error fetching the customers!", error);
    });
  }, []);

  // Triggered when the Edit button is clicked
  const handleEditClick = (customer) => {
    setEditingCustomer(customer['phone_number']);
    setUpdatedCustomer(customer); // Set the selected customer to be edited
  };

  // Handle input changes during editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedCustomer({
      ...updatedCustomer,
      [name]: value
    });
  };

  // Save the updated customer data
  const handleSaveClick = () => {
    axios.put('https://3dm9uksgnf.execute-api.ap-southeast-2.amazonaws.com/prod/update', updatedCustomer, {
      headers: {
        'x-api-key': 'YOUR_API_KEY', 
        'Content-Type': 'application/json'
      }
    })
    .then(() => {
      // Set editing state back to null and update customer list with new values
      setEditingCustomer(null);
      setCustomers((prevCustomers) => prevCustomers.map(c =>
        c['phone_number'] === updatedCustomer['phone_number'] ? updatedCustomer : c
      ));
    })
    .catch(error => {
      console.error("Error updating the customer!", error);
    });
  };

  return (
    <div className="customer-table">
      <h2>Manage Customers</h2>
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
                    <button onClick={() => handleEditClick(customer)}>Edit</button>
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
    </div>
  );
};

export default CustomerTable;
