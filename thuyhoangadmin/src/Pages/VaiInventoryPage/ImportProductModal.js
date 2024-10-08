import React, { useState, useEffect } from 'react';
import './ImportProductModal.css'; // Import styles for the modal

const ImportProductModal = ({ isVisible, handleClose, onSave, colors }) => {
  const [importData, setImportData] = useState({
    Customer: '',
    TotalAmount: '',
    ProductDetail: '',  // Temporary field for product details as string
    Color: '',          // Temporary field for selected color
    ProductList: {},    // Dictionary to store color as key and product details as value (list of numbers)
    totalProduct: 0,    // Total count of all products across colors
    TotalMeter: 0,      // Total sum of all product meters
    Status: 'Import',   // Set default status as 'Import'
    Note: ''            // New field for user note
  });

  const [errorMessage, setErrorMessage] = useState('');  // To display error messages

  // Handle input changes for import data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImportData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total product count and total meters based on ProductList
  const calculateTotals = (productList) => {
    let totalProduct = 0;
    let totalMeter = 0;

    for (const color in productList) {
      const productValues = productList[color];
      const numericValues = productValues.filter(value => !isNaN(value) && value > 0);
      totalProduct += numericValues.length;
      totalMeter += numericValues.reduce((acc, value) => acc + value, 0);
    }

    return { totalProduct, totalMeter };
  };

  // Calculate total product and meters for a specific color
  const calculateColorTotals = (productValues) => {
    const numericValues = productValues.filter(value => !isNaN(value) && value > 0);
    const colorTotalProduct = numericValues.length;
    const colorTotalMeter = numericValues.reduce((acc, value) => acc + value, 0);
    return { colorTotalProduct, colorTotalMeter };
  };

  // Add selected color and product detail to the ProductList
  const handleAddProduct = () => {
    if (importData.Color && importData.ProductDetail) {
      const productValues = importData.ProductDetail.split(',').map((item) => parseFloat(item.trim()) || 0);

      // Add the new color and product detail to the ProductList dictionary
      const updatedProductList = {
        ...importData.ProductList,
        [importData.Color]: productValues
      };

      // Calculate totals after adding the new product
      const { totalProduct, totalMeter } = calculateTotals(updatedProductList);

      setImportData((prev) => ({
        ...prev,
        ProductList: updatedProductList, // Update the ProductList
        totalProduct,                    // Update total product count
        TotalMeter: totalMeter,          // Update total meter count
        Color: '',                       // Reset Color field
        ProductDetail: ''                // Reset ProductDetail field
      }));
    }
  };

  const handleSave = async () => {
    setErrorMessage(''); // Reset error message before saving
  
    // Calculate the Detail field based on the ProductList
    const detail = {};
    Object.keys(importData.ProductList).forEach((color) => {
      const { colorTotalProduct, colorTotalMeter } = calculateColorTotals(importData.ProductList[color]);
      detail[color] = {
        TotalProduct: colorTotalProduct,
        TotalMeter: `${colorTotalMeter} meters`
      };
    });
  
    try {
      // Prepare the request body to match the DynamoDB table structure for TrackingInventory
      const requestBody = {
        Customer: importData.Customer,
        TotalAmount: Number(importData.TotalAmount),  // Convert to number
        ProductList: importData.ProductList,          // Pass the ProductList dictionary
        TotalProduct: importData.totalProduct,        // Total product count
        TotalMeter: `${importData.TotalMeter} meters`,  // Convert total meters to string with unit
        Status: importData.Status,                    // Import/Export status
        Note: importData.Note || '',                  // Optional note field
        Detail: detail                                // Detailed breakdown of total product and meters for each color
      };
  
      // Make a POST request to add the data to TrackingInventory
      const trackingResponse = await fetch('https://towbaoz4e2.execute-api.ap-southeast-2.amazonaws.com/prod/add-tranking-invent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!trackingResponse.ok) {
        throw new Error(`Failed to add data to TrackingInventory. Status: ${trackingResponse.status}`);
      }
  
      console.log('Data added successfully to TrackingInventory.');
  
      // Update VaiInventory based on the product colors and details
      const updateVaiInventory = async () => {
        const vaiInventoryUpdatePromises = Object.keys(importData.ProductList).map(async (color) => {
          const newProductDetails = importData.ProductList[color]; // New product details for the current color
  
          // First, fetch existing product details for the color from VaiInventory
          let productID = '';
          try {
            console.log(`Fetching existing details for color: ${color}`);
            const fetchResponse = await fetch(`https://04r3lehsc8.execute-api.ap-southeast-2.amazonaws.com/prod/get?color=${encodeURIComponent(color)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
  
            if (fetchResponse.ok) {
              const data = await fetchResponse.json();
              console.log(`Fetched data for color ${color}:`, data);
  
              // Check if data is a valid JSON string and parse it
              const parsedData = typeof data.body === 'string' ? JSON.parse(data.body) : data;
  
              // Find the ProductID for the color in the parsed data
              const matchingItem = parsedData.find(item => item.Color === color);
              if (matchingItem && matchingItem.ProductID) {
                productID = matchingItem.ProductID;
                console.log(`Found existing ProductID: ${productID} for color ${color}`);
              } else {
                console.warn(`No existing ProductID found for color ${color}. Data structure:`, parsedData);
              }
            } else {
              console.warn(`Failed to fetch details for color ${color}. Status: ${fetchResponse.status}`);
            }
          } catch (error) {
            console.error(`Error fetching existing ProductID for color ${color}:`, error);
          }
  
          // If no existing ProductID is found, create a new one
          if (!productID) {
            productID = `PROD_${color}_${Date.now()}`;
            console.log(`Generated new ProductID: ${productID} for color ${color}`);
          }
  
          // Prepare request body for VaiInventory update
          const updateBody = {
            ProductID: productID,  // Use retrieved or new Product ID
            Color: color,
            totalProduct: newProductDetails.length,
            ProductDetail: newProductDetails,
            TotalMeter: `${newProductDetails.reduce((sum, num) => sum + num, 0)} meters`  // Calculate total meter
          };
  
          try {
            // Make a PUT request to update VaiInventory for each color
            const vaiResponse = await fetch('https://2t6r0vxhzf.execute-api.ap-southeast-2.amazonaws.com/prod/update', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateBody),
            });
  
            if (!vaiResponse.ok) {
              throw new Error(`Failed to update VaiInventory for color ${color}. Status: ${vaiResponse.status}`);
            }
  
            console.log(`Successfully updated VaiInventory for color ${color}.`);
  
          } catch (error) {
            console.error(`Error updating VaiInventory for color ${color}:`, error);
          }
        });
  
        // Await all update promises
        await Promise.all(vaiInventoryUpdatePromises);
      };
  
      await updateVaiInventory();
  
      console.log('Data added successfully to both TrackingInventory and VaiInventory.');
      onSave(importData); // Pass the data back to parent component if needed
      handleClose(); // Close the modal after successful save
  
    } catch (error) {
      console.error('Error while adding or updating data:', error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };
  
  

  useEffect(() => {
    // Reset the import data when modal is opened or closed
    if (!isVisible) {
      setImportData({
        Customer: '',
        Color: '',
        TotalAmount: '',
        ProductDetail: '',
        ProductList: {},
        totalProduct: 0,
        TotalMeter: 0,
        Status: 'Import', // Reset status to 'Import'
        Note: ''          // Reset note field
      });
    }
  }, [isVisible]);

  return (
    isVisible && (
      <div className="import-modal">
        <div className="modal-content">
          <h3>Import Product</h3>

          {/* Display error message, if any */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Input for Customer Name */}
          <input
            type="text"
            name="Customer"
            placeholder="Customer Name"
            value={importData.Customer}
            onChange={handleInputChange}
          />

          {/* Dropdown for Color selection populated with colors from parent component */}
          <select
            name="Color"
            value={importData.Color}
            onChange={handleInputChange}
          >
            <option value="">Select Color</option>
            {colors && colors.length > 0 ? (
              colors.map((color, index) => (
                <option key={index} value={color}>{color}</option>
              ))
            ) : (
              <option value="">No colors available</option>
            )}
          </select>

          {/* Input for Product Detail */}
          <input
            type="text"
            name="ProductDetail"
            placeholder="Product Detail (comma-separated numbers)"
            value={importData.ProductDetail}
            onChange={handleInputChange}
          />

          {/* Add Product Button */}
          <button onClick={handleAddProduct} disabled={!importData.Color || !importData.ProductDetail}>
            Add Product
          </button>

          {/* Display list of added colors and product details */}
          <div className="product-list">
            <h4>Added Products</h4>
            <ul>
              {Object.keys(importData.ProductList).map((color, index) => {
                const { colorTotalProduct, colorTotalMeter } = calculateColorTotals(importData.ProductList[color]);
                return (
                  <li key={`${color}-${index}`}> {/* Use unique keys for each list element */}
                    <strong>{color}</strong>: {importData.ProductList[color].join(', ')}
                    <p> - Total Product: {colorTotalProduct}</p>
                    <p> - Total Meter: {colorTotalMeter} meters</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Display calculated overall total product and total meter */}
          <div className="totals">
            <p><strong>Overall Total Product:</strong> {importData.totalProduct}</p>
            <p><strong>Overall Total Meter:</strong> {importData.TotalMeter} meters</p>
          </div>

          {/* Input for Total Amount */}
          <input
            type="number"
            name="TotalAmount"
            placeholder="Total Amount"
            value={importData.TotalAmount}
            onChange={handleInputChange}
          />

          {/* Input for Note */}
          <textarea
            name="Note"
            placeholder="Additional Note"
            value={importData.Note}
            onChange={handleInputChange}
            rows="3"
          />

          {/* Hidden Input for Status - Hardcoded as 'Import' */}
          <input type="hidden" name="Status" value={importData.Status} />

          {/* Modal buttons for save and cancel */}
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
