import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PantsProduct.css';

const PantsProduct = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // State for tracking the product being edited
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
  const [filterColor, setFilterColor] = useState('All'); // State for the selected color filter

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products from the API
  const fetchProducts = () => {
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        const productData = JSON.parse(response.data.body);
        setProducts(Array.isArray(productData) ? productData : []);
      })
      .catch(error => {
        console.error("Error fetching the pants products!", error);
      });
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilterColor(e.target.value);
  };

  // Set the product for editing and copy its data into the updatedProduct state
  const handleEditClick = (product) => {
    setEditingProduct(product.ProductID); // Set the ID of the product being edited
    setUpdatedProduct({ ...product }); // Pre-fill the form with the product's existing data
  };

  // Update the input fields in the updatedProduct state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProduct(prev => ({
      ...prev,
      [name]: name === 'Size' || name === 'Quantity' ? Number(value) : value, // Ensure Size and Quantity are numbers
    }));
  };

  // Save the updated product to the API
  const handleSaveClick = () => {
    if (!updatedProduct.ProductID) {
      console.error("ProductID is missing!");
      return;
    }

    axios.put('https://0wg7yclqgf.execute-api.ap-southeast-2.amazonaws.com/prod/update', 
      { body: JSON.stringify(updatedProduct) }, // Wrap the data under "body"
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(response => {
      console.log("Product update response:", response.data);
      setEditingProduct(null); // Exit edit mode
      fetchProducts(); // Refresh the product list after the update
    })
    .catch(error => {
      console.error("Error updating the product:", error);
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
      console.error("Error adding the product:", error);
    });
  };

  // Handle deleting a product (with confirmation modal)
  const handleDeleteClick = (productID) => {
    setProductToDelete(productID);  // Set the product ID to be deleted
    setIsDeleteModalVisible(true);  // Show the delete confirmation modal
  };

  // Confirm deletion of the product
  const confirmDeleteProduct = () => {
    axios.delete('https://d28pbjftsc.execute-api.ap-southeast-2.amazonaws.com/prod/delete', {
      data: JSON.stringify({
        body: JSON.stringify({ ProductID: productToDelete })
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log(`Product ${productToDelete} deleted successfully!`);
      fetchProducts();  // Refresh the product list
      setIsDeleteModalVisible(false);  // Close the delete confirmation modal
      setProductToDelete(null);  // Reset the product to delete
    })
    .catch(error => {
      console.error(`Error deleting product ${productToDelete}`, error);
    });
  };

  // Filter products by selected color
  const filteredProducts = filterColor === 'All' ? products : products.filter(product => product.Color === filterColor);

  return (
    <div className="pants-product-table">
      <div className="header-container">
        <h2>Manage Pants Products</h2>
        <button onClick={() => setIsAddingNew(true)} className="add-new-button">Thêm</button>
      </div>
  
      {/* Move the Dropdown Filter by Color below the header */}
      <div className="filter-container">
        <label htmlFor="colorFilter">Filter by Color:</label>
        <select id="colorFilter" value={filterColor} onChange={handleFilterChange} className="filter-dropdown">
          <option value="All">All</option>
          {Array.from(new Set(products.map(product => product.Color))).map(color => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
    
      <table>
        <thead>
          <tr>
            <th>Mã Sản Phẩm</th>
            <th>Màu Sắc</th>
            <th>Size</th>
            <th>Số Lượng</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <tr key={product.ProductID}>
                <td>{editingProduct === product.ProductID ? (
                  <input
                    type="text"
                    name="ProductID"
                    value={updatedProduct.ProductID}
                    onChange={handleInputChange}
                    readOnly // Prevent ProductID from being edited
                  />
                ) : (
                  product.ProductID
                )}</td>
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
                      <button onClick={() => handleEditClick(product)} className="edit-button">Chỉnh</button>
                      <button onClick={() => handleDeleteClick(product.ProductID)} className="delete-button">Xóa</button>
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
            <h3>Thêm Sản Phẩm Mới</h3>
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
            <h3>Bạn Chắc Chứ?</h3>
            <p>Bạn có chắc muốn xóa sản phẩm này không {productToDelete}?</p>
            <button onClick={confirmDeleteProduct}>Đồng Ý</button>
            <button onClick={() => setIsDeleteModalVisible(false)}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantsProduct;
