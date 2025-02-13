import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CheckoutSuccess = () => {
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');

    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [location]);

  const verifyPayment = async (sessionId) => {
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();

      if (data.success) {
        setPaymentVerified(true);
      } else {
        setError('Payment verification failed');
      }
    } catch (err) {
      setError('Error verifying payment');
    }
  };

  return (
    <div>
      {paymentVerified ? (
        <h2>Payment Successful! Thank you for your purchase.</h2>
      ) : (
        <h2>{error || 'Verifying payment...'}</h2>
      )}
    </div>
  );
};

export default CheckoutSuccess;
