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
        const parsedBody = JSON.parse(result.body);

        // Set data if it exists, otherwise log an error and set to an empty array
        if (parsedBody && parsedBody.data) {
          setData(parsedBody.data);
        } else {
          console.error('Unexpected data structure:', parsedBody);
          setData([]);
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

  // Helper function to translate Status
  const translateStatus = (status) => {
    switch (status) {
      case 'Import':
        return 'Nhập Hàng';
      case 'Export':
        return 'Xuất Hàng';
      default:
        return status;
    }
  };

  // Helper function to render ProductList as formatted text
  const renderProductList = (productList) => {
    if (!productList || Object.keys(productList).length === 0) {
      return 'N/A';
    }

    return (
      <ul>
        {Object.keys(productList).map((color, index) => (
          <li key={index}>
            <strong>{color}:</strong> {productList[color].map((num) => num.toLocaleString()).join(', ')}
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
            <strong>{color}:</strong> Tổng Số Cây: {detail[color].TotalProduct}, Tổng Mét: {detail[color].TotalMeter}
          </li>
        ))}
      </ul>
    );
  };

  // Render loading or error messages
  if (loading) return <div>Đang tải...</div>; // Loading
  if (error) return <div>Lỗi: {error}</div>;  // Error

  // Render the table with fetched data
  return (
    <div className="inventory-page">
      <div className="header-container">
        <h2>Quản Lý Tồn Kho</h2> {/* Updated title to match other pages */}
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Ngày & Giờ</th> {/* Date & Time */}
            <th>ID</th>
            <th>Trạng Thái</th> {/* Status */}
            <th>Khách Hàng</th> {/* Customer */}
            <th>Danh Sách Hàng Hoá</th> {/* Product List */}
            <th>Tổng Số Tiền</th> {/* Total Amount */}
            <th>Tổng Mét</th> {/* Total Meter */}
            <th>Tổng Số Lượng</th> {/* Total Product */}
            <th>Chi Tiết Hàng Hoá</th> {/* Detail */}
            <th>Ghi Chú</th> {/* Note */}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td>{item['Date&Time']}</td> {/* Display Date & Time */}
                <td>{item.ID}</td> {/* Displaying ID */}
                <td>{translateStatus(item.Status)}</td> {/* Translated Status */}
                <td>{item.Customer}</td> {/* Displaying Customer */}
                <td>{renderProductList(item.ProductList)}</td> {/* Displaying Product List */}
                <td>{item.TotalAmount}</td> {/* Displaying Total Amount */}
                <td>{item.TotalMeter}</td> {/* Displaying Total Meter */}
                <td>{item.TotalProduct}</td> {/* Displaying Total Product */}
                <td>{renderDetail(item.Detail)}</td> {/* Displaying Detail */}
                <td>{item.Note || 'N/A'}</td> {/* Displaying Note */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">Không có dữ liệu</td> {/* Updated colspan to 10 */}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
