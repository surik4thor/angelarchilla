import React from 'react';
import HomePlans from '../components/HomePlans.jsx';
import HomeBenefits from '../components/HomeBenefits.jsx';
import '../styles/PlanesPage.css';

export default function PlanesPage(props) {
  return (
    <div className="planes-page">
      <h1 className="planes-title">Planes y Beneficios</h1>
      <HomePlans {...props} />
      <div className="planes-benefits">
        <HomeBenefits />
      </div>
    </div>
  );
}
