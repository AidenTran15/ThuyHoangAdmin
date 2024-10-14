import React, { useState, useEffect } from 'react';
import './InventoryPage.css'; // Import CSS for styling if needed

const InventoryPage = () => {
  const [data, setData] = useState([]); // Initialize data as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); // State to store the selected status filter
  const [filteredData, setFilteredData] = useState([]); // State to store filtered data
  const [currentPage, setCurrentPage] = useState(1); // State to track the current page
  const itemsPerPage = 10; // Number of items to display per page

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
          const sortedData = parsedBody.data.sort((a, b) => new Date(b['Date&Time']) - new Date(a['Date&Time'])); // Sort by Date&Time
          setData(sortedData);
          setFilteredData(sortedData); // Initially, set filteredData to the sorted data
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

  // Function to translate status
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

  // Handle filtering the data based on the selected status
  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredData(data); // Show all data when filter is set to 'All'
    } else {
      setFilteredData(data.filter((item) => translateStatus(item.Status) === statusFilter));
    }
    setCurrentPage(1); // Reset to the first page when the filter changes
  }, [statusFilter, data]);

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Helper function to replace "meters" with "mét"
  const replaceMetersWithMet = (text) => {
    if (typeof text === 'string') {
      return text.replace(/meters/g, 'mét');
    }
    return text;
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

  // Helper function to render Detail as formatted text with translated meters
  const renderDetail = (detail) => {
    if (!detail || Object.keys(detail).length === 0) {
      return 'N/A';
    }

    return (
      <ul>
        {Object.keys(detail).map((color, index) => (
          <li key={index}>
            <strong>{color}:</strong> Tổng Số Cây: {detail[color].TotalProduct}, Tổng Mét: {replaceMetersWithMet(detail[color].TotalMeter)}
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
      {/* Status Filter Dropdown */}
      <div className="filter-container">
        <label htmlFor="statusFilter">Lọc Theo Trạng Thái: </label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="All">Tất Cả</option>
          <option value="Nhập Hàng">Nhập Hàng</option>
          <option value="Xuất Hàng">Xuất Hàng</option>
        </select>
      </div>
      <div className="header-container">
        <h2>Quản Lý Tồn Kho</h2>
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
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item['Date&Time']}</td> {/* Display Date & Time */}
                <td>{item.ID}</td> {/* Displaying ID */}
                <td>{translateStatus(item.Status)}</td> {/* Translated Status */}
                <td>{item.Customer}</td> {/* Displaying Customer */}
                <td>{renderProductList(item.ProductList)}</td> {/* Displaying Product List */}
                <td>{item.TotalAmount}</td> {/* Displaying Total Amount */}
                <td>{replaceMetersWithMet(item.TotalMeter)}</td> {/* Replacing meters with mét */}
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

      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>
          Trang Trước
        </button>
        <span>Trang {currentPage} trong {totalPages}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>
          Trang Sau
        </button>
      </div>
    </div>
  );
};

export default InventoryPage;
