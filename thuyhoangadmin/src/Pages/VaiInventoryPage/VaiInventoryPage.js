import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VaiInventoryPage.css'; // Import CSS for styling
import ImportProductModal from './ImportProductModal'; // Import the Import modal component
import ExportProductModal from './ExportProductModal'; // Import the Export modal component

const VaiInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    ProductID: '',
    Color: '',
    totalProduct: '',
    ProductDetail: [],
    TotalMeter: ''
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDetail, setCurrentDetail] = useState('');
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false); // State for Import modal visibility
  const [isExportModalVisible, setIsExportModalVisible] = useState(false); // State for Export modal visibility
  const [colors, setColors] = useState([]); // State to store unique colors

  // Function to fetch products from the API
  const fetchProducts = () => {
    setIsLoading(true);
    axios
      .get('https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get') // Replace with your Lambda URL
      .then((response) => {
        const productData = JSON.parse(response.data.body);
        console.log('Fetched product data:', productData); // Add logging
        const validProducts = Array.isArray(productData)
          ? productData.filter((product) => product && product.ProductID)
          : [];
        setProducts(validProducts);
        const uniqueColors = [...new Set(validProducts.map((product) => product.Color))]; // Use validProducts here
        setColors(uniqueColors);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching products!', error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Fetch products from the API and extract unique colors
    fetchProducts();
  }, []);

  // Handle input changes for adding or editing a product
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new detail to ProductDetail array
  const handleAddProductDetail = () => {
    if (currentDetail && !isNaN(currentDetail)) {
      setNewProduct((prev) => {
        const updatedProductDetail = [...prev.ProductDetail, parseFloat(currentDetail)];
        const totalMeter = updatedProductDetail.reduce((sum, num) => sum + num, 0); // Calculate total meter
        const totalProductCount = updatedProductDetail.length; // Calculate total number of items
        return {
          ...prev,
          ProductDetail: updatedProductDetail,
          TotalMeter: `${totalMeter} mét`, // Update TotalMeter automatically with translated unit
          totalProduct: totalProductCount // Update totalProduct automatically
        };
      });
      setCurrentDetail(''); // Clear the input field after adding
    }
  };

  // Handle removing a product detail from ProductDetail array
  const handleRemoveDetail = (index) => {
    setNewProduct((prev) => {
      const updatedProductDetail = prev.ProductDetail.filter((_, i) => i !== index);
      const totalMeter = updatedProductDetail.reduce((sum, num) => sum + num, 0);
      return {
        ...prev,
        ProductDetail: updatedProductDetail,
        TotalMeter: `${totalMeter} mét`,
        totalProduct: updatedProductDetail.length
      };
    });
  };

  const handleSaveProduct = () => {
    if (!newProduct.ProductID) {
      alert('Mã sản phẩm là bắt buộc!');
      return;
    }

    const apiUrl = isEditing
      ? `https://2t6r0vxhzf.execute-api.ap-southeast-2.amazonaws.com/prod/update`
      : `https://goq3m8d3ve.execute-api.ap-southeast-2.amazonaws.com/prod/add`;

    const requestMethod = isEditing ? axios.put : axios.post; // Use PUT for editing, POST for adding

    requestMethod(
      apiUrl,
      { body: JSON.stringify(newProduct) },
      { headers: { 'Content-Type': 'application/json' } }
    )
      .then(() => {
        setProducts((prev) =>
          isEditing
            ? prev.map((p) => (p.ProductID === newProduct.ProductID ? newProduct : p))
            : [...prev, newProduct]
        );
        setNewProduct({ ProductID: '', Color: '', totalProduct: '', ProductDetail: [], TotalMeter: '' });
        setIsAddingNew(false);
        setIsEditing(false);
      })
      .catch((error) => console.error(`Lỗi khi ${isEditing ? 'cập nhật' : 'thêm'} sản phẩm:`, error));
  };

  const handleDeleteProduct = () => {
    axios({
      method: 'delete',
      url: 'https://27emf55jka.execute-api.ap-southeast-2.amazonaws.com/prod/delete',
      data: { body: JSON.stringify({ ProductID: productToDelete }) },
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setProducts((prev) => prev.filter((product) => product.ProductID !== productToDelete));
        setIsDeleteModalVisible(false);
        setProductToDelete(null);
      })
      .catch((error) => console.error(`Lỗi khi xóa sản phẩm ${productToDelete}:`, error));
  };

  // Updated handleImportSave function
  const handleImportSave = () => {
    fetchProducts(); // Fetch updated products after import
  };

  const handleExportSave = () => {
    fetchProducts(); // Fetch updated products after export
  };

  return (
    <div className="vai-inventory-page">
      <div className="header-container">
        <h2>Quản Lý Tồn Kho</h2> {/* Translated title */}
        <button onClick={() => { setIsAddingNew(true); setIsEditing(false); }} className="add-new-button">Tạo Mới</button>
        <button onClick={() => setIsImportModalVisible(true)} className="import-button">Nhập Hàng</button> {/* Translated Import Button */}
        <button onClick={() => setIsExportModalVisible(true)} className="export-button">Xuất Hàng</button> {/* Translated Export Button */}
      </div>

      {isLoading ? (
        <p>Đang tải...</p> // Translated loading message
      ) : (
        <table className="vai-inventory-table">
          <thead>
            <tr>
              <th>Mã Sản Phẩm</th>
              <th>Màu</th>
              <th>Chi Tiết Số Mét Từng Cây</th>
              <th>Tổng Số Cây</th>
              <th>Tổng Mét</th>
              <th>Xoá Hàng</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) =>
                product && product.ProductID ? (
                  <tr key={product.ProductID}>
                    <td>{product.ProductID}</td>
                    <td>{product.Color}</td>
                    <td>
                      {Array.isArray(product.ProductDetail)
                        ? product.ProductDetail.join(', ')
                        : product.ProductDetail || 'No details'}
                    </td>
                    <td>{product.totalProduct}</td>
                    <td>{product.TotalMeter}</td>
                    <td>
                      {/* Removed the Edit button */}
                      <button
                        className="action-button delete-button"
                        onClick={() => {
                          setProductToDelete(product.ProductID);
                          setIsDeleteModalVisible(true);
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ) : null
              )
            ) : (
              <tr>
                <td colSpan="6">Không có sản phẩm để hiển thị.</td>
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
              readOnly={isEditing}
            />
            <input
              type="text"
              name="Color"
              placeholder="Màu Sắc"
              value={newProduct.Color}
              onChange={handleNewProductChange}
            />
            <div className="product-detail-section">
              <input
                type="number"
                placeholder="Nhập Chi Tiết Sản Phẩm"
                value={currentDetail}
                onChange={(e) => setCurrentDetail(e.target.value)}
              />
              <button className="add-detail-button" onClick={handleAddProductDetail}>
                +
              </button>
            </div>
            <ul className="product-detail-list">
              {newProduct.ProductDetail.map((detail, index) => (
                <li key={index}>
                  {detail} mét
                  <button
                    className="remove-detail-button"
                    onClick={() => handleRemoveDetail(index)}
                    title="Xóa Chi Tiết"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>

            <div className="total-fields">
              <div>
                <label>Tổng Số Cây:</label>
                <input type="text" name="totalProduct" value={newProduct.totalProduct} readOnly />
              </div>
              <div>
                <label>Tổng Mét:</label>
                <input type="text" name="TotalMeter" value={newProduct.TotalMeter} readOnly />
              </div>
            </div>

            <div className="modal-buttons">
              <button onClick={handleSaveProduct}>{isEditing ? 'Cập Nhật' : 'Lưu'}</button>
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setIsEditing(false);
                }}
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isDeleteModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>Bạn có chắc muốn xóa sản phẩm này?</h3>
            <p>Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteProduct}>Xóa</button>
              <button onClick={() => setIsDeleteModalVisible(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Product Modal */}
      {isImportModalVisible && (
        <ImportProductModal
          isVisible={isImportModalVisible}
          handleClose={() => setIsImportModalVisible(false)}
          onSave={handleImportSave} // No longer passing importData
          colors={colors} // Pass colors state from VaiInventoryPage
        />
      )}

      {/* Export Product Modal */}
      {isExportModalVisible && (
        <ExportProductModal
          isVisible={isExportModalVisible}
          handleClose={() => setIsExportModalVisible(false)}
          onSave={handleExportSave} // Define this function to handle exported data saving
          colors={colors} // Pass colors state from VaiInventoryPage
        />
      )}
    </div>
  );
};

export default VaiInventoryPage;
