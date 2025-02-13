import Stripe from 'stripe';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import Payment from '../models/payment.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { eventId, quantity, ticketType } = req.body;
    const userId = req.user._id;

    // Find event and user data from the database
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: 'Event or User not found' });
    }

    // Adjust the price based on ticket type
    let ticketPrice = event.price;
    if (ticketType === 'VIP') {
      ticketPrice = event.price * 1.5;
    } else if (ticketType === 'Student') {
      ticketPrice = event.price * 0.8;
    }

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: event.name,
              description: `${ticketType} Ticket for ${event.name}`,
            },
            unit_amount: ticketPrice * 100, // Convert price to cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    });

    // Store the payment information in the database with status 'pending'
    const payment = new Payment({
      user: userId,
      event: eventId,
      amount: ticketPrice * quantity * 100, // Amount in cents
      status: 'pending',
      paymentMethod: 'card',
      stripeSessionId: session.id,
    });

    await payment.save();

    // Send the session ID back to the client to redirect them to Stripe Checkout
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ message: 'Server error creating Stripe checkout session' });
  }
};

// Webhook to handle Stripe events (e.g., payment completion)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify the webhook event signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the 'checkout.session.completed' event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Find the payment record in your database using the session ID
      const payment = await Payment.findOne({ stripeSessionId: session.id });

      if (!payment) {
        console.error('Payment not found for session ID:', session.id);
        return res.status(404).send('Payment not found');
      }

      // Update the payment status to 'completed'
      payment.status = 'completed';
      await payment.save();

      console.log('Payment successfully completed:', payment);
    } catch (err) {
      console.error('Error updating payment status:', err);
      return res.status(500).send('Internal server error');
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// Verify Payment Status
export const verifyPayment = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update the payment status in your database
      const payment = await Payment.findOneAndUpdate(
        { stripeSessionId: sessionId },
        { status: 'completed' },
        { new: true }
      );

      return res.status(200).json({ success: true, payment });
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Error verifying payment" });
  }
};
