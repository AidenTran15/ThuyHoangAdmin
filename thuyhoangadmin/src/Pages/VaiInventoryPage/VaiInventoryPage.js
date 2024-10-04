import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VaiInventoryPage.css'; // Import CSS for styling

const VaiInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    ProductID: '',
    Color: '',
    totalProduct: '',
    ProductDetail: '', // Use a string to temporarily store the comma-separated values
    TotalMeter: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false); // State to manage add product modal visibility
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all products from the Lambda API on component mount
  useEffect(() => {
    axios
      .get('https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get') // Replace with your Lambda URL
      .then((response) => {
        // Assuming the response body is a JSON array of products
        const productData = JSON.parse(response.data.body);
        console.log('Fetched Products: ', productData);
        setProducts(Array.isArray(productData) ? productData : []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching the products!', error);
        setIsLoading(false);
      });
  }, []);

  // Handle input changes for adding a new product
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding a new product
  const handleAddProductSaveClick = () => {
    if (!newProduct.ProductID) {
      alert('ProductID is required for adding a product!');
      return;
    }

    // Convert ProductDetail to an array of numbers
    const productDetailArray = newProduct.ProductDetail.split(',').map((item) => parseFloat(item.trim()));

    // Prepare the product data to send to the backend
    const productData = {
      ...newProduct,
      ProductDetail: productDetailArray // Replace ProductDetail string with array of numbers
    };

    axios
      .post(
        'https://YOUR_API_GATEWAY_URL/prod/add', // Replace with your API Gateway URL
        { body: JSON.stringify(productData) },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      .then((response) => {
        console.log('Product added successfully:', response.data);
        setProducts((prev) => [...prev, productData]); // Add new product to the table
        setNewProduct({
          ProductID: '',
          Color: '',
          totalProduct: '',
          ProductDetail: '',
          TotalMeter: ''
        }); // Reset form
        setIsAddingNew(false); // Close modal
      })
      .catch((error) => {
        console.error('Error adding the product:', error);
      });
  };

  // Placeholder functions for edit and delete actions
  const handleEditClick = (productId) => {
    alert(`Edit functionality for Product ID: ${productId} not implemented yet.`);
  };

  const handleDeleteClick = (productId) => {
    alert(`Delete functionality for Product ID: ${productId} not implemented yet.`);
  };

  return (
    <div className="vai-inventory-page">
      <div className="header-container">
        <h2>Quản Lý Tồn Kho</h2>
        <button onClick={() => setIsAddingNew(true)} className="add-new-button">
          Tạo Mới
        </button>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="vai-inventory-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Color</th>
              <th>Total Product</th>
              <th>Product Detail</th>
              <th>Total Meter</th>
              <th>Action</th> {/* New Action column */}
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.ProductID}>
                  <td>{product.ProductID}</td>
                  <td>{product.Color}</td>
                  <td>{product.totalProduct}</td>
                  {/* Check if ProductDetail is an array before using join */}
                  <td>{Array.isArray(product.ProductDetail) ? product.ProductDetail.join(', ') : product.ProductDetail}</td>
                  <td>{product.TotalMeter}</td>
                  <td>
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditClick(product.ProductID)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteClick(product.ProductID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Add New Product Modal */}
      {isAddingNew && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm Sản Phẩm Mới</h3>
            <input
              type="text"
              name="ProductID"
              placeholder="Mã Sản Phẩm"
              value={newProduct.ProductID}
              onChange={handleNewProductChange}
            />
            <input
              type="text"
              name="Color"
              placeholder="Màu Sắc"
              value={newProduct.Color}
              onChange={handleNewProductChange}
            />
            <input
              type="number"
              name="totalProduct"
              placeholder="Tổng Sản Phẩm"
              value={newProduct.totalProduct}
              onChange={handleNewProductChange}
            />
            <input
              type="text"
              name="ProductDetail"
              placeholder="Chi Tiết Sản Phẩm (e.g., 50, 55.5, 51)"
              value={newProduct.ProductDetail}
              onChange={handleNewProductChange}
            />
            <input
              type="text"
              name="TotalMeter"
              placeholder="Tổng Mét"
              value={newProduct.TotalMeter}
              onChange={handleNewProductChange}
            />
            <div className="modal-buttons">
              <button onClick={handleAddProductSaveClick}>Lưu</button>
              <button onClick={() => setIsAddingNew(false)}>Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaiInventoryPage;
