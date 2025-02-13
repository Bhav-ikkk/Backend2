import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useParams } from 'react-router-dom';  // Correct use of useParams
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { eventId } = useParams();  // Event ID from URL parameters

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [ticketType, setTicketType] = useState('Standard'); // Add a state for ticket type
    const [quantity, setQuantity] = useState(1); // Add a state for ticket quantity

    const [isRegistered, setIsRegistered] = useState(false); // Track if the user is successfully registered

    // Handle normal form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const userData = { name: username, email, password };

        // POST request to backend to create user
        axios.post(`http://localhost:5000/api/auth/signup`, userData)
            .then(response => {
                alert('Signup successful');
                // Store the token in localStorage
                localStorage.setItem('authToken', response.data.token);
                setIsRegistered(true); // Mark the user as registered

                // If eventId is present, redirect to checkout page with the event ID
                if (eventId) {
                    navigate(`/checkout/${eventId}`);
                } else {
                    navigate('/checkout');  // Fallback if no eventId
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                alert('Error during registration');
            });
    };

    // Handle Google signup success
    const handleGoogleSuccess = (response) => {
        const token = response.credential; // The token from Google

        // Send token to backend for signup
        axios.post(`http://localhost:5000/api/auth/google-signup`, { token })
            .then(response => {
                alert('Signup successful with Google');
                // Store the token in localStorage
                localStorage.setItem('authToken', response.data.token);
                setIsRegistered(true); // Mark the user as registered

                // If eventId is present, redirect to checkout page with the event ID
                if (eventId) {
                    navigate(`/checkout/${eventId}`);
                } else {
                    navigate('/checkout');  // Fallback if no eventId
                }
            })
            .catch(error => {
                console.error('Google signup error:', error);
                alert('Google signup error');
            });
    };

    // Handle Google signup failure
    const handleGoogleFailure = (error) => {
        console.error('Google signup failed:', error);
        alert('Google signup failed');
    };

    // Initiate Stripe checkout process if eventId exists
    const initiatePayment = async () => {
        if (!eventId) {
            return alert("Event ID is required to initiate payment.");
        }

        try {
            // POST request to create a Stripe checkout session
            const response = await axios.post('http://localhost:5000/api/create-checkout-session', {
                eventId,
                ticketType,
                quantity
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`  // Pass the auth token
                }
            });

            const { sessionId } = response.data;
            // Redirect to Stripe checkout
            const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);
            await stripe.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Error initiating payment.');
        }
    };

    return (
        <GoogleOAuthProvider clientId="528316752763-vukvoen52dr5mhpvllqpt0fet2c9oj3b.apps.googleusercontent.com">
            <div className="register-container">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <button type="submit" className="register-button">Register</button>
                </form>

                <div className="google-login-container">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleFailure}
                        useOneTap
                    />
                </div>

                {/* Add ticket type and quantity selection */}
                <div className="ticket-selection-container">
                    <label htmlFor="ticketType">Select Ticket Type:</label>
                    <select
                        id="ticketType"
                        value={ticketType}
                        onChange={(e) => setTicketType(e.target.value)}
                    >
                        <option value="Standard">Standard</option>
                        <option value="VIP">VIP</option>
                        <option value="Student">Student</option>
                    </select>

                    <label htmlFor="quantity">Ticket Quantity:</label>
                    <input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                    />
                </div>

                {/* Add the payment initiation button if the user is registered */}
                {eventId && isRegistered && (
                    <div className="payment-container">
                        <button onClick={initiatePayment} className="payment-button">
                            Proceed to Payment
                        </button>
                    </div>
                )}
            </div>
        </GoogleOAuthProvider>
    );
};

export default Register;
