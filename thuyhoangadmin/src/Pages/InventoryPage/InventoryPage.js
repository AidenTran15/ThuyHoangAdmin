import React, { useState, useEffect } from 'react';
import './InventoryPage.css'; // Import CSS cho việc styling nếu cần

const InventoryPage = () => {
  const [data, setData] = useState([]); // Khởi tạo data là một mảng rỗng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All'); // Trạng thái bộ lọc được chọn
  const [filteredData, setFilteredData] = useState([]); // Dữ liệu đã được lọc
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 10; // Số lượng mục hiển thị trên mỗi trang

  // Hàm phân tích chuỗi ngày giờ
  const parseDateString = (dateString) => {
    // dateString có định dạng 'dd/mm/yyyy hh:mm'
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };

  // Hàm sắp xếp theo 'Date&Time' giảm dần
  const sortByDateDescending = (dataArray) => {
    return dataArray.sort((a, b) => parseDateString(b['Date&Time']) - parseDateString(a['Date&Time']));
  };

  // Fetch dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://3rrtaunk1g.execute-api.ap-southeast-2.amazonaws.com/prod/get');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const result = await response.json();
        const parsedBody = JSON.parse(result.body);

        // Set data nếu tồn tại, nếu không log lỗi và set thành mảng rỗng
        if (parsedBody && parsedBody.data) {
          // Sắp xếp data theo 'Date&Time' giảm dần (mới nhất trước)
          const sortedData = sortByDateDescending(parsedBody.data);
          setData(sortedData);
          setFilteredData(sortedData); // Ban đầu, set filteredData thành dữ liệu đã sắp xếp
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

  // Hàm dịch trạng thái
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

  // Xử lý lọc dữ liệu dựa trên trạng thái được chọn
  useEffect(() => {
    let newFilteredData;
    if (statusFilter === 'All') {
      newFilteredData = data; // Hiển thị tất cả dữ liệu khi bộ lọc là 'All'
    } else {
      newFilteredData = data.filter((item) => translateStatus(item.Status) === statusFilter);
    }
    // Sắp xếp dữ liệu đã lọc theo 'Date&Time' giảm dần
    const sortedFilteredData = sortByDateDescending(newFilteredData);
    setFilteredData(sortedFilteredData);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  }, [statusFilter, data]);

  // Xử lý phân trang
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

  // Hàm thay thế "meters" bằng "mét"
  const replaceMetersWithMet = (text) => {
    if (typeof text === 'string') {
      return text.replace(/meters/g, 'mét');
    }
    return text;
  };

  // Hàm hiển thị ProductList dưới dạng văn bản có định dạng
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

  // Hàm hiển thị Detail dưới dạng văn bản có định dạng và dịch "meters"
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

  // Hiển thị thông báo loading hoặc lỗi
  if (loading) return <div>Đang tải...</div>; // Loading
  if (error) return <div>Lỗi: {error}</div>;  // Error

  // Hiển thị bảng với dữ liệu đã fetch
  return (
    <div className="inventory-page">
      {/* Dropdown Lọc Trạng Thái */}
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
                <td>{item['Date&Time']}</td> {/* Hiển thị Ngày & Giờ */}
                <td>{item.ID}</td> {/* Hiển thị ID */}
                <td>{translateStatus(item.Status)}</td> {/* Trạng Thái đã dịch */}
                <td>{item.Customer}</td> {/* Hiển thị Khách Hàng */}
                <td>{renderProductList(item.ProductList)}</td> {/* Hiển thị Danh Sách Hàng Hoá */}
                <td>{item.TotalAmount}</td> {/* Hiển thị Tổng Số Tiền */}
                <td>{replaceMetersWithMet(item.TotalMeter)}</td> {/* Thay thế "meters" bằng "mét" */}
                <td>{item.TotalProduct}</td> {/* Hiển thị Tổng Số Lượng */}
                <td>{renderDetail(item.Detail)}</td> {/* Hiển thị Chi Tiết Hàng Hoá */}
                <td>{item.Note || 'N/A'}</td> {/* Hiển thị Ghi Chú */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">Không có dữ liệu</td> {/* Cập nhật colspan thành 10 */}
            </tr>
          )}
        </tbody>
      </table>

      {/* Điều khiển Phân trang */}
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
