import React, { useState, useEffect } from 'react';
import './ImportProductModal.css'; // Import styles for the modal
import { FiPlus, FiX } from 'react-icons/fi'; // Import icons for add and remove buttons

const ImportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  // Initialize ProductDetail as an empty array instead of an empty string
  const [importData, setImportData] = useState({
    Customer: '',
    TotalAmount: '',
    Color: '',
    ProductDetail: [], // Initialize ProductDetail as an array
    ProductList: {},
    totalProduct: 0,
    TotalMeter: 0,
    Status: 'Import',
    Note: '',
  });

  const [currentDetail, setCurrentDetail] = useState(''); // Track current product detail input
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes for import data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImportData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add product detail for the selected color
  const handleAddProductDetail = () => {
    if (currentDetail && !isNaN(currentDetail)) {
      setImportData((prev) => {
        const updatedProductDetail = [...prev.ProductDetail, parseFloat(currentDetail)];
        return {
          ...prev,
          ProductDetail: updatedProductDetail,
        };
      });
      setCurrentDetail(''); // Clear input after adding
    }
  };

  // Remove a product detail by index
  const handleRemoveDetail = (index) => {
    setImportData((prev) => {
      const updatedProductDetail = prev.ProductDetail.filter((_, i) => i !== index);
      return {
        ...prev,
        ProductDetail: updatedProductDetail,
      };
    });
  };

  // Add product detail to ProductList and calculate totals
  const handleAddProduct = () => {
    if (importData.Color && importData.ProductDetail.length > 0) {
      const updatedProductList = {
        ...importData.ProductList,
        [importData.Color]: importData.ProductDetail,
      };

      // Calculate totals
      const { totalProduct, totalMeter } = calculateTotals(updatedProductList);

      setImportData((prev) => ({
        ...prev,
        ProductList: updatedProductList,
        totalProduct,
        TotalMeter: totalMeter,
        Color: '',
        ProductDetail: [], // Reset ProductDetail to an empty array
      }));
    }
  };

  // Calculate total product count and total meters based on ProductList
  const calculateTotals = (productList) => {
    let totalProduct = 0;
    let totalMeter = 0;

    for (const color in productList) {
      const productValues = productList[color];
      totalProduct += productValues.length;
      totalMeter += productValues.reduce((acc, value) => acc + value, 0);
    }

    return { totalProduct, totalMeter };
  };

  // Calculate total product and meters for a specific color
  const calculateColorTotals = (productValues) => {
    const numericValues = productValues.filter((value) => !isNaN(value) && value > 0);
    const colorTotalProduct = numericValues.length;
    const colorTotalMeter = numericValues.reduce((acc, value) => acc + value, 0);
    return { colorTotalProduct, colorTotalMeter };
  };

  useEffect(() => {
    if (!isVisible) {
      // Reset import data when the modal is closed
      setImportData({
        Customer: '',
        Color: '',
        TotalAmount: '',
        ProductDetail: [], // Ensure ProductDetail is reset to an empty array
        ProductList: {},
        totalProduct: 0,
        TotalMeter: 0,
        Status: 'Import',
        Note: '',
      });
    }
  }, [isVisible]);

  // Handle the save process, including API requests and modal closure
  const handleSave = async () => {
    setErrorMessage(''); // Reset error message before saving

    // Calculate the Detail field based on the ProductList
    const detail = {};
    Object.keys(importData.ProductList).forEach((color) => {
      const { colorTotalProduct, colorTotalMeter } = calculateColorTotals(importData.ProductList[color]);
      detail[color] = {
        TotalProduct: colorTotalProduct,
        TotalMeter: `${colorTotalMeter} meters`,
      };
    });

    try {
      // Prepare the request body to match the DynamoDB table structure for TrackingInventory
      const requestBody = {
        Customer: importData.Customer,
        TotalAmount: Number(importData.TotalAmount),
        ProductList: importData.ProductList,
        TotalProduct: importData.totalProduct,
        TotalMeter: `${importData.TotalMeter} meters`,
        Status: importData.Status,
        Note: importData.Note || '',
        Detail: detail,
      };

      console.log('Request Body:', requestBody);

      // Make a POST request to add the data to TrackingInventory
      const trackingResponse = await fetch(
        'https://towbaoz4e2.execute-api.ap-southeast-2.amazonaws.com/prod/add-tranking-invent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!trackingResponse.ok) {
        throw new Error(`Failed to add data to TrackingInventory. Status: ${trackingResponse.status}`);
      }

      console.log('Data added successfully to TrackingInventory.');

      // Update VaiInventory based on the product colors and details
      await updateVaiInventory();

      console.log('Data added successfully to both TrackingInventory and VaiInventory.');

      // Close the modal and reset data
      handleClose();
      onSave(importData); // Optional: pass data back to parent component if needed
    } catch (error) {
      console.error('Error while adding or updating data:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  // Function to update VaiInventory based on the product colors and details
  const updateVaiInventory = async () => {
    const vaiInventoryUpdatePromises = Object.keys(importData.ProductList).map(async (color) => {
      const newProductDetails = importData.ProductList[color];

      let productID = '';
      try {
        console.log(`Fetching existing details for color: ${color}`);
        const fetchResponse = await fetch(
          `https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get?color=${encodeURIComponent(color)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          const parsedData = typeof data.body === 'string' ? JSON.parse(data.body) : data;

          const matchingItem = parsedData.find((item) => item.Color === color);
          if (matchingItem && matchingItem.ProductID) {
            productID = matchingItem.ProductID;
          }
        }
      } catch (error) {
        console.error(`Error fetching existing ProductID for color ${color}:`, error);
      }

      if (!productID) {
        productID = `PROD_${color}_${Date.now()}`;
      }

      const updateBody = {
        ProductID: productID,
        Color: color,
        totalProduct: newProductDetails.length,
        ProductDetail: newProductDetails,
        TotalMeter: `${newProductDetails.reduce((sum, num) => sum + num, 0)} meters`,
      };

      try {
        const vaiResponse = await fetch(
          'https://2t6r0vxhzf.execute-api.ap-southeast-2.amazonaws.com/prod/update',
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateBody),
          }
        );

        if (!vaiResponse.ok) {
          throw new Error(`Failed to update VaiInventory for color ${color}. Status: ${vaiResponse.status}`);
        }

        console.log(`Successfully updated VaiInventory for color ${color}.`);
      } catch (error) {
        console.error(`Error updating VaiInventory for color ${color}:`, error);
      }
    });

    await Promise.all(vaiInventoryUpdatePromises);
  };

  return (
    isVisible && (
      <div className="import-modal">
        <div className="modal-content">
          <h3>Import Product</h3>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <label>Customer Name</label>
          <input
            type="text"
            name="Customer"
            placeholder="Enter customer name"
            value={importData.Customer}
            onChange={handleInputChange}
            className="modal-input"
          />

          <label>Select Color</label>
          <select name="Color" value={importData.Color} onChange={handleInputChange} className="modal-input">
            <option value="">Choose a color</option>
            {colors.map((color, index) => (
              <option key={index} value={color}>
                {color}
              </option>
            ))}
          </select>

          <div className="product-detail-section">
            <input
              type="number"
              placeholder="Enter Product Detail (e.g., 10)"
              value={currentDetail}
              onChange={(e) => setCurrentDetail(e.target.value)}
              className="modal-input"
            />
            <button className="add-detail-button" onClick={handleAddProductDetail}>
              <FiPlus />
            </button>
          </div>

          <ul className="product-detail-list">
            {Array.isArray(importData.ProductDetail) &&
              importData.ProductDetail.map((detail, index) => (
                <li key={index}>
                  {detail} meters
                  <button className="remove-detail-button" onClick={() => handleRemoveDetail(index)}>
                    <FiX />
                  </button>
                </li>
              ))}
          </ul>

          <button onClick={handleAddProduct} disabled={!importData.Color || importData.ProductDetail.length === 0}>
            Add Product to List
          </button>

          <div className="product-list">
            <h4>Added Products</h4>
            <ul>
              {Object.keys(importData.ProductList).map((color) => (
                <li key={color}>
                  <strong>{color}:</strong> {importData.ProductList[color].join(', ')}
                </li>
              ))}
            </ul>
          </div>

          <div className="totals">
            <p>
              <strong>Overall Total Product:</strong> {importData.totalProduct}
            </p>
            <p>
              <strong>Overall Total Meter:</strong> {importData.TotalMeter} meters
            </p>
          </div>

          <label>Total Amount</label>
          <input
            type="number"
            name="TotalAmount"
            placeholder="Total Amount"
            value={importData.TotalAmount}
            onChange={handleInputChange}
            className="modal-input"
          />

          <label>Additional Note</label>
          <textarea
            name="Note"
            placeholder="Any additional information..."
            value={importData.Note}
            onChange={handleInputChange}
            rows="3"
            className="modal-input"
          />

          <div className="modal-buttons">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleClose}>Cancel</button>
          </div>
        </div>
      </div>
    )
  );
};

export default ImportProductModal;

