import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VaiInventoryPage.css'; // Import CSS for styling

const VaiInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products from the Lambda API on component mount
  useEffect(() => {
    axios.get('https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get') // Replace with your Lambda URL
      .then(response => {
        // Assuming the response body is a JSON array of products
        const productData = JSON.parse(response.data.body); // Parse the JSON string if it's in a string format
        console.log("Fetched Products: ", productData);
        setProducts(Array.isArray(productData) ? productData : []); // Ensure it's an array before setting state
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching the products!", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="vai-inventory-table">
      <h2>Vai Inventory Management</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Color</th>
              <th>Total Product</th>
              <th>Product Detail</th>
              <th>Total Meter</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.ProductID}>
                  <td>{product.ProductID}</td>
                  <td>{product.Color}</td>
                  <td>{product.totalProduct}</td>
                  <td>{product.ProductDetail}</td>
                  <td>{product.TotalMeter}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VaiInventoryPage;
