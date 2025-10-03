import React from 'react';

interface BillingPromoBannerProps {
  code?: string;
  message?: string;
}

const BillingPromoBanner: React.FC<BillingPromoBannerProps> = ({
  code = 'EarlyAdopter',
  message = 'Use code EarlyAdopter at checkout to get 50% off our annual plan',
}) => (
  <div style={{
    background: '#fbeaf0',
    color: '#c42142',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    margin: '0.5rem 0 1rem 0',
    fontWeight: 500,
    fontSize: '1rem',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  }}>
    {message.includes(code) ? (
      <>Use code <strong>{code}</strong> at checkout to get 50% off our annual plan</>
    ) : (
      message
    )}
  </div>
);

export default BillingPromoBanner;
