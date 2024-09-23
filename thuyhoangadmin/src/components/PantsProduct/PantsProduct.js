import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PantsProduct.css'; // Ensure this file contains the appropriate styling

const PantsProduct = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({});
  const [newProduct, setNewProduct] = useState({
    ProductID: '',
    Color: '',
    Size: 0,
    Quantity: 0
  });
  const [isAddingNew, setIsAddingNew] = useState(false);

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

  const handleAddNewClick = () => {
    setIsAddingNew(true);
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProductSave = () => {
    axios.post('https://a1h71clwgl.execute-api.ap-southeast-2.amazonaws.com/prod/add', newProduct)
      .then(() => {
        setProducts(prevProducts => [...prevProducts, newProduct]);
        setIsAddingNew(false);
        setNewProduct({ ProductID: '', Color: '', Size: 0, Quantity: 0 }); // Reset form
      })
      .catch(error => {
        console.error("Error adding the new product!", error);
      });
  };

  return (
    <div className="pants-product-table">
      <h2>Manage Pants Products</h2>
      <button onClick={handleAddNewClick} className="add-new-button">Add New Product</button>

      <table>
        <thead>
          <tr>
            <th>ProductID</th>
            <th>Color</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Actions</th>
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

      {/* Modal for adding a new product */}
      {isAddingNew && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add New Product</h3>
            <input 
              type="text" 
              name="ProductID" 
              placeholder="Product ID" 
              value={newProduct.ProductID} 
              onChange={handleNewProductChange} 
            />
            <input 
              type="text" 
              name="Color" 
              placeholder="Color" 
              value={newProduct.Color} 
              onChange={handleNewProductChange} 
            />
            <input 
              type="number" 
              name="Size" 
              placeholder="Size" 
              value={newProduct.Size} 
              onChange={handleNewProductChange} 
            />
            <input 
              type="number" 
              name="Quantity" 
              placeholder="Quantity" 
              value={newProduct.Quantity} 
              onChange={handleNewProductChange} 
            />
            <button onClick={handleAddProductSave}>Save</button>
            <button onClick={() => setIsAddingNew(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantsProduct;
