import { useState } from 'react';

const PaymentPage = ({ eventId, ticketType, quantity }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // Make an API call to create checkout session
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, ticketType, quantity }),
      });

      const { sessionId } = await res.json();

      // Redirect to Stripe Checkout
      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
      await stripe.redirectToCheckout({ sessionId });

    } catch (error) {
      console.error('Error creating checkout session:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Payment for Event</h2>
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Loading...' : 'Proceed to Payment'}
      </button>
    </div>
  );
};

export default PaymentPage;
