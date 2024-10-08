import React, { useState, useEffect } from 'react';
import './InventoryPage.css'; // Import CSS for styling if needed

const InventoryPage = () => {
  const [data, setData] = useState([]); // Initialize data as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from the API when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://3rrtaunk1g.execute-api.ap-southeast-2.amazonaws.com/prod/get');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const result = await response.json();
        console.log('Raw API Response:', result);

        // Parse the body field since it is a JSON string
        const parsedBody = JSON.parse(result.body);
        console.log('Parsed Body:', parsedBody);

        // Set data if it exists, otherwise log an error and set to an empty array
        if (parsedBody && parsedBody.data) {
          setData(parsedBody.data);
        } else {
          console.error('Unexpected data structure:', parsedBody);
          setData([]); // Set empty array if structure is unexpected
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render loading or error messages
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Helper function to render ProductList as formatted text
  const renderProductList = (productList) => {
    if (!productList || Object.keys(productList).length === 0) {
      return 'N/A';
    }

    return (
      <ul>
        {Object.keys(productList).map((color, index) => (
          <li key={index}>
            <strong>{color}:</strong> {productList[color]}
          </li>
        ))}
      </ul>
    );
  };

  // Helper function to render Detail as formatted text
  const renderDetail = (detail) => {
    if (!detail || Object.keys(detail).length === 0) {
      return 'N/A';
    }

    return (
      <ul>
        {Object.keys(detail).map((color, index) => (
          <li key={index}>
            <strong>{color}:</strong> Total Product: {detail[color].TotalProduct}, Total Meter: {detail[color].TotalMeter}
          </li>
        ))}
      </ul>
    );
  };

  // Render the table with fetched data
  return (
    <div className="inventory-page">
      <h2>Tracking Inventory</h2>
      <table className="inventory-table">
        <thead>
          <tr>
            {/* Removed ID and added new headers */}
            <th>Date & Time</th>
            <th>Customer</th>
            <th>Product List</th>
            <th>Status</th>
            <th>Total Amount</th>
            <th>Total Meter</th>
            <th>Total Product</th>
            <th>Detail</th> {/* New column for Detail */}
            <th>Note</th>    {/* New column for Note */}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item['Date&Time']}</td>
                <td>{item.Customer}</td>
                <td>{renderProductList(item.ProductList)}</td>
                <td>{item.Status}</td>
                <td>{item.TotalAmount}</td>
                <td>{item.TotalMeter}</td>
                <td>{item.TotalProduct}</td>
                <td>{renderDetail(item.Detail)}</td> {/* Displaying Detail */}
                <td>{item.Note || 'N/A'}</td>         {/* Displaying Note */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
