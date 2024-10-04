import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VaiInventoryPage.css'; // Import CSS for styling

const VaiInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    ProductID: '',
    Color: '',
    totalProduct: '', // Total number of items in ProductDetail list
    ProductDetail: '', // Use a string to temporarily store the comma-separated values
    TotalMeter: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false); // State to manage add product modal visibility
  const [isEditing, setIsEditing] = useState(false); // State to check if we are editing an existing product
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

  // Handle input changes for adding or editing a product
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;

    // If the input is for ProductDetail, calculate TotalMeter and totalProduct based on the list of values
    if (name === 'ProductDetail') {
      const detailList = value.split(',').map((item) => parseFloat(item.trim())).filter(item => !isNaN(item)); // Convert string to array of numbers and filter out NaN values
      const totalMeter = detailList.reduce((sum, num) => sum + num, 0); // Calculate total meter
      const totalProductCount = detailList.length; // Calculate total number of items in the list

      setNewProduct((prev) => ({
        ...prev,
        ProductDetail: value, // Store the raw string input
        TotalMeter: `${totalMeter} meters`, // Update TotalMeter automatically
        totalProduct: totalProductCount // Update totalProduct automatically
      }));
    } else {
      setNewProduct((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle saving a new product or updating an existing product
  const handleSaveProduct = () => {
    if (!newProduct.ProductID) {
      alert('ProductID is required!');
      return;
    }

    // Convert ProductDetail to an array of numbers
    const productDetailArray = newProduct.ProductDetail.split(',').map((item) => parseFloat(item.trim()));

    // Prepare the product data to send to the backend
    const productData = {
      ...newProduct,
      ProductDetail: productDetailArray // Replace ProductDetail string with array of numbers
    };

    // Determine the API URL and method based on whether we are editing or adding a new product
    const apiUrl = isEditing
      ? `https://2t6r0vxhzf.execute-api.ap-southeast-2.amazonaws.com/prod/update` // Use this URL for updating with PUT method
      : `https://goq3m8d3ve.execute-api.ap-southeast-2.amazonaws.com/prod/add`; // Use this URL for adding with POST method

    const requestMethod = isEditing ? axios.put : axios.post; // Use PUT for editing, POST for adding

    requestMethod(
      apiUrl,
      { body: JSON.stringify(productData) },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then((response) => {
        console.log(`Product ${isEditing ? 'updated' : 'added'} successfully:`, response.data);

        // Update the product list
        setProducts((prev) => {
          if (isEditing) {
            // Replace the edited product in the list
            return prev.map((product) =>
              product.ProductID === newProduct.ProductID ? productData : product
            );
          } else {
            // Add new product to the list
            return [...prev, productData];
          }
        });

        // Reset form and close modal
        setNewProduct({
          ProductID: '',
          Color: '',
          totalProduct: '',
          ProductDetail: '',
          TotalMeter: ''
        });
        setIsAddingNew(false);
        setIsEditing(false);
      })
      .catch((error) => {
        console.error(`Error ${isEditing ? 'updating' : 'adding'} the product:`, error);

        // Log additional error information for debugging
        if (error.response) {
          console.error('Error Response Data:', error.response.data);
          console.error('Error Response Status:', error.response.status);
          console.error('Error Response Headers:', error.response.headers);
        } else if (error.request) {
          console.error('Error Request:', error.request);
        } else {
          console.error('Error Message:', error.message);
        }
      });
  };

  // Handle editing an existing product
  const handleEditClick = (productId) => {
    const productToEdit = products.find((product) => product.ProductID === productId);

    if (productToEdit) {
      // Populate the modal with the selected product's data
      setNewProduct({
        ProductID: productToEdit.ProductID,
        Color: productToEdit.Color,
        totalProduct: productToEdit.totalProduct,
        ProductDetail: productToEdit.ProductDetail.join(', '), // Convert array back to string
        TotalMeter: productToEdit.TotalMeter
      });
      setIsAddingNew(true);
      setIsEditing(true);
    }
  };

  // Handle deleting a product (Placeholder)
  const handleDeleteClick = (productId) => {
    alert(`Delete functionality for Product ID: ${productId} not implemented yet.`);
  };

  return (
    <div className="vai-inventory-page">
      <div className="header-container">
        <h2>Quản Lý Tồn Kho</h2>
        <button onClick={() => { setIsAddingNew(true); setIsEditing(false); }} className="add-new-button">
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

      {/* Add/Edit Product Modal */}
      {isAddingNew && (
        <div className="modal">
          <div className="modal-content">
            <h3>{isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
            <input
              type="text"
              name="ProductID"
              placeholder="Mã Sản Phẩm"
              value={newProduct.ProductID}
              onChange={handleNewProductChange}
              readOnly={isEditing} // ProductID is read-only in edit mode
            />
            <input
              type="text"
              name="Color"
              placeholder="Màu Sắc"
              value={newProduct.Color}
              onChange={handleNewProductChange}
            />
            {/* Move ProductDetail above totalProduct */}
            <input
              type="text"
              name="ProductDetail"
              placeholder="Chi Tiết Sản Phẩm (e.g., 50, 55.5, 51)"
              value={newProduct.ProductDetail}
              onChange={handleNewProductChange}
            />
            {/* totalProduct is now read-only and calculated automatically */}
            <input
              type="number"
              name="totalProduct"
              placeholder="Tổng Sản Phẩm"
              value={newProduct.totalProduct}
              readOnly
            />
            {/* Display TotalMeter as read-only input field */}
            <input
              type="text"
              name="TotalMeter"
              placeholder="Tổng Mét"
              value={newProduct.TotalMeter}
              readOnly
            />
            <div className="modal-buttons">
              <button onClick={handleSaveProduct}>{isEditing ? 'Cập Nhật' : 'Lưu'}</button>
              <button onClick={() => { setIsAddingNew(false); setIsEditing(false); }}>Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaiInventoryPage;
