import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PantsProduct.css'; // Ensure this file contains the appropriate styling

const PantsProduct = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedProduct, setUpdatedProduct] = useState({
    ProductID: '',
    Color: '',
    Size: 0,
    Quantity: 0,
  });

  const [newProduct, setNewProduct] = useState({
    ProductID: '',
    Color: '',
    Size: 0,
    Quantity: 0
  });

  const [isAddingNew, setIsAddingNew] = useState(false); // State to manage add product modal visibility
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false); // State to manage delete confirmation modal visibility
  const [productToDelete, setProductToDelete] = useState(null); // Store the productID of the product to be deleted

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from the Lambda function via API Gateway
  const fetchProducts = () => {
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        const productData = JSON.parse(response.data.body);  // Ensure response is parsed correctly
        setProducts(Array.isArray(productData) ? productData : []);
      })
      .catch(error => {
        console.error("Error fetching the pants products!", error);
      });
  };

  // Set the product for editing and copy its data into the updatedProduct state
  const handleEditClick = (product) => {
    setEditingProduct(product.ProductID);
    setUpdatedProduct({ ...product }); // Ensure ProductID is included
  };

  // Update the input fields in the updatedProduct state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct(prev => ({
      ...prev,
      [name]: name === 'Size' || name === 'Quantity' ? Number(value) : value,  // Ensure Size and Quantity are numbers
      ProductID: prev.ProductID // Ensure ProductID stays intact
    }));
  };

  // Save the updated product to the API
  const handleSaveClick = () => {
    console.log("Updating product:", updatedProduct);  // Log the updated product before the request
  
    // Ensure ProductID is present
    if (!updatedProduct.ProductID) {
      console.error("ProductID is missing!");  // Log if ProductID is missing
      return;
    }
  
    // Use axios.put for updating the product
    axios.put('https://0wg7yclqgf.execute-api.ap-southeast-2.amazonaws.com/prod/update', 
      { body: JSON.stringify(updatedProduct) }, // Wrap the data under "body"
      {
        headers: {
          'Content-Type': 'application/json'  // Ensure Content-Type is JSON
        }
      }
    )
    .then(response => {
      console.log("Product update response:", response.data);  // Log the response from the server
      setEditingProduct(null);  // Exit edit mode
      fetchProducts();  // Re-fetch the product list after the update
    })
    .catch(error => {
      console.error("Error updating the product:", error.response ? error.response.data : error.message);  // Log detailed error message
    });
  };

  // Handle changes for adding a new product
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'Size' || name === 'Quantity' ? Number(value) : value  // Ensure Size and Quantity are numbers
    }));
  };

  // Add a new product
  const handleAddProductSaveClick = () => {
    console.log("Adding new product:", newProduct);

    // Ensure that ProductID is not empty
    if (!newProduct.ProductID) {
      console.error("ProductID is required for adding a product!");
      return;
    }

    axios.post('https://a1h71clwgl.execute-api.ap-southeast-2.amazonaws.com/prod/add', 
      { body: JSON.stringify(newProduct) }, // Wrap data under "body"
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(response => {
      console.log("Product added successfully:", response.data);
      fetchProducts();  // Refresh the product list
      setNewProduct({ ProductID: '', Color: '', Size: 0, Quantity: 0 }); // Reset form
      setIsAddingNew(false); // Close modal
    })
    .catch(error => {
      console.error("Error adding the product:", error.response ? error.response.data : error.message);
    });
  };

  // Handle deleting a product (with confirmation modal)
  const handleDeleteClick = (productID) => {
    setProductToDelete(productID);  // Set the product ID to be deleted
    setIsDeleteModalVisible(true);  // Show the delete confirmation modal
  };

  // Confirm deletion of the product
  const confirmDeleteProduct = () => {
    const apiUrl = `https://d28pbjftsc.execute-api.ap-southeast-2.amazonaws.com/prod/delete`;
    console.log(`Attempting to delete product with ID: ${productToDelete}`);
  
    axios.delete(apiUrl, {
      data: JSON.stringify({
        body: JSON.stringify({ ProductID: productToDelete })
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Product ${productToDelete} deleted successfully! Response:`, response.data);
      fetchProducts();  // Refresh the product list
      setIsDeleteModalVisible(false);  // Close the delete confirmation modal
      setProductToDelete(null);  // Reset the product to delete
    })
    .catch(error => {
      console.error(`Error deleting product ${productToDelete}`, error);
    });
  };

  return (
    <div className="pants-product-table">
      <h2>Manage Pants Products</h2>
      <button onClick={() => setIsAddingNew(true)} className="add-new-button">Add New Product</button>

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
                    value={updatedProduct.Color || ''}
                    onChange={handleInputChange}
                  />
                ) : (
                  product.Color
                )}</td>
                <td>{editingProduct === product.ProductID ? (
                  <input
                    type="number"
                    name="Size"
                    value={updatedProduct.Size || 0}
                    onChange={handleInputChange}
                  />
                ) : (
                  product.Size
                )}</td>
                <td>{editingProduct === product.ProductID ? (
                  <input
                    type="number"
                    name="Quantity"
                    value={updatedProduct.Quantity || 0}
                    onChange={handleInputChange}
                  />
                ) : (
                  product.Quantity
                )}</td>
                <td>
                  {editingProduct === product.ProductID ? (
                    <button onClick={handleSaveClick}>Save</button>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(product)}>Edit</button>
                      <button onClick={() => handleDeleteClick(product.ProductID)} style={{ backgroundColor: 'red', color: 'white', marginLeft: '5px' }}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No products found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add New Product Modal */}
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
            <button onClick={handleAddProductSaveClick}>Save</button>
            <button onClick={() => setIsAddingNew(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete product {productToDelete}?</p>
            <button onClick={confirmDeleteProduct}>Yes, Delete</button>
            <button onClick={() => setIsDeleteModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantsProduct;
