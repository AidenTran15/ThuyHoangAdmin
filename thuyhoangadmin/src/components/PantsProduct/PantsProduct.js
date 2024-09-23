import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PantsProduct.css'; // Ensure this file contains the appropriate styling

const PantsProduct = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({});

  useEffect(() => {
    // Fetch data from the Lambda function via API Gateway
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        const productData = JSON.parse(response.data.body);  // Ensure response is parsed correctly
        setProducts(Array.isArray(productData) ? productData : []);
      })
      .catch(error => {
        console.error("Error fetching the pants products!", error);
      });
  }, []);

  const handleEditClick = (product) => {
    setEditingProduct(product.ProductID);
    setUpdatedProduct(product); // Set the product to be edited
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveClick = () => {
    // Add logic to update the product through an API call
    axios.put('https://0wg7yclqgf.execute-api.ap-southeast-2.amazonaws.com/prod/update', updatedProduct)
      .then(() => {
        setEditingProduct(null);
        setProducts((prevProducts) =>
          prevProducts.map(p => 
            p.ProductID === updatedProduct.ProductID ? updatedProduct : p
          )
        );
      })
      .catch(error => {
        console.error("Error updating the product!", error);
      });
  };

  const handleDeleteClick = (productID) => {
    axios.delete('https://d28pbjftsc.execute-api.ap-southeast-2.amazonaws.com/prod/delete', {
      data: { ProductID: productID }
    })
      .then(() => {
        setProducts(prevProducts => prevProducts.filter(p => p.ProductID !== productID));
      })
      .catch(error => {
        console.error("Error deleting the product!", error);
      });
  };

  return (
    <div className="pants-product-table">
      <h2>Manage Pants Products</h2>
      <table>
        <thead>
          <tr>
            <th>ProductID</th>
            <th>Color</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Actions</th> {/* Added Actions column */}
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => (
              <tr key={product.ProductID}>
                <td>{product.ProductID}</td>
                <td>{editingProduct === product.ProductID ? (
                  <input
                    type="text"
                    name="Color"
                    value={updatedProduct.Color}
                    onChange={handleInputChange}
                  />
                ) : (
                  product.Color
                )}</td>
                <td>{editingProduct === product.ProductID ? (
                  <input
                    type="number"
                    name="Size"
                    value={updatedProduct.Size}
                    onChange={handleInputChange}
                  />
                ) : (
                  product.Size
                )}</td>
                <td>{editingProduct === product.ProductID ? (
                  <input
                    type="number"
                    name="Quantity"
                    value={updatedProduct.Quantity}
                    onChange={handleInputChange}
                  />
                ) : (
                  product.Quantity
                )}</td>
                <td>{editingProduct === product.ProductID ? (
                  <button onClick={handleSaveClick}>Save</button>
                ) : (
                  <>
                    <button onClick={() => handleEditClick(product)}>Edit</button>
                    <button
                      onClick={() => handleDeleteClick(product.ProductID)}
                      style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}
                    >
                      Delete
                    </button>
                  </>
                )}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No products found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PantsProduct;
