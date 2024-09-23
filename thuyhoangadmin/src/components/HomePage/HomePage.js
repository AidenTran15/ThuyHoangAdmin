import React from 'react';
import CustomerTable from '../CustomerTable/CustomerTable'; 
import PantsProduct from '../PantsProduct/PantsProduct'; 
import OrderTable from '../OrderTable/OrderTable';



const HomePage = () => {
  return (
    <div>
      <br/>
      <br/>
      <CustomerTable />
      <br/>
      <br/>
      <br/>
      <PantsProduct/> 
      <br/>
      <br/>
      <br/>
      <OrderTable/>
    </div>
  );
};

export default HomePage;
