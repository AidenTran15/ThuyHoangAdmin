import React from 'react';
import CustomerTable from '../CustomerTable/CustomerTable';  // Import the CustomerTable component

const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <CustomerTable />  {/* Display the CustomerTable component */}
    </div>
  );
};

export default HomePage;
