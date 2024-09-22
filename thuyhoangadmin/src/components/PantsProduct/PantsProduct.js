import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PantsProduct.css'; // Ensure this file contains the appropriate styling

const PantsProduct = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch data from the Lambda function via API Gateway
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        // Ensure the data is correctly parsed
        const productData = JSON.parse(response.data.body); // Parse the body as it's a stringified JSON
        setProducts(Array.isArray(productData) ? productData : []); // Ensure it's an array
      })
      .catch(error => {
        console.error("Error fetching the pants products!", error);
      });
  }, []);

  return (
    <div className="pants-product-table">
      <h2>Manage Pants Products</h2>
      <table>
        <thead>
          <tr>
            <th>Color</th>
            <th>Size</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={`${product.Color}-${product.Size}`}>
                <td>{product.Color}</td>
                <td>{product.Size}</td>
                <td>{product.Quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No products found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PantsProduct;
