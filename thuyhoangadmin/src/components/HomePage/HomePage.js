import './HomePage.css'; 

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    axios.get('https://twnbtj6wuc.execute-api.ap-southeast-2.amazonaws.com/prod/customers')
      .then(response => {
        const customerData = JSON.parse(response.data.body);
        setCustomers(Array.isArray(customerData) ? customerData : []);
      })
      .catch(error => {
        console.error("There was an error fetching the customers!", error);
      });
  }, []);

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
                <td>{customer.name}</td>
                <td>{customer['phone_number']}</td>
                <td>{customer.address}</td>
                <td>{customer.short_price}</td>
                <td>{customer.dress_price}</td>
                <td>
                  <button>Block</button>
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
