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

  // Handle adding a new product
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'Size' || name === 'Quantity' ? Number(value) : value  // Ensure Size and Quantity are numbers
    }));
  };

  const handleAddClick = () => {
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
    })
    .catch(error => {
      console.error("Error adding the product:", error.response ? error.response.data : error.message);
    });
  };

  // Handle deleting a product
  const handleDeleteClick = (productID) => {
    if (!window.confirm(`Are you sure you want to delete product ${productID}?`)) return;
  
    // Log the API URL and productID for debugging
    const apiUrl = `https://d28pbjftsc.execute-api.ap-southeast-2.amazonaws.com/prod/delete`;
    console.log(`Attempting to delete product with ID: ${productID}`);
    console.log(`Calling API URL: ${apiUrl}`);
  
    // Format the request body as expected by the Lambda function
    const requestBody = JSON.stringify({
      body: JSON.stringify({ ProductID: productID })  // Send the ProductID inside a "body" field as a JSON string
    });
  
    // Send the DELETE request
    axios.delete(apiUrl, {
      data: requestBody,  // Pass the formatted request body
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Product ${productID} deleted successfully! Response:`, response.data);
      fetchProducts();  // Refresh the product list
    })
    .catch(error => {
      // Log any error that occurs
      if (error.response) {
        console.error(`Error deleting product ${productID}. Status: ${error.response.status}`, error.response.data);
      } else {
        console.error(`Error deleting product ${productID}. Message: ${error.message}`);
      }
    });
  };
  


  return (
    <div className="pants-product-table">
      <h2>Manage Pants Products</h2>

      {/* Form for adding new products */}
      <div className="add-new-product">
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
        <button onClick={handleAddClick}>Add Product</button>
      </div>

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
    </div>
  );
};

export default PantsProduct;
