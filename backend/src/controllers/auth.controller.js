import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Function to create default admin
const createDefaultAdmin = async () => {
    const adminExists = await User.findOne({ email: 'ayush.1429agr@gmail.com' });
    if (!adminExists) {
        const admin = await User.create({
            name: 'Ayush',
            email: 'ayush.1429agr@gmail.com',
            password: '3264623', // Make sure to hash the password properly in a real app
            role: 'admin', // Admin role for this user
        });

        console.log('Default admin user created:', admin);

        // Generate JWT tokens for the newly created admin
        const { accessToken, refreshToken } = generateTokens(admin._id);

        // Optionally, store the refresh token in Redis
        await storeRefreshToken(admin._id, refreshToken);

        console.log('JWT Access Token:', accessToken);
        console.log('JWT Refresh Token:', refreshToken);
    }
};

// Call this function when the server starts to create a default admin
createDefaultAdmin();

// Function to set cookies with JWT tokens
const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Admin Signup route (only allows admin users to sign up other admins)
export const adminSignup = async (req, res) => {
    console.log('Admin signup request received:', req.body);
    const { email, password, name, role } = req.body;

    try {
        // Check if the user requesting the admin signup is an admin
        if (req.user && req.user.role === 'admin') {
            const userExists = await User.findOne({ email });

            if (userExists) {
                return res.status(400).json({ message: "User already exists" });
            }

            // Validate role, but only allow 'admin' or 'customer' roles
            const validRoles = ['customer', 'admin'];
            const userRole = validRoles.includes(role) ? role : 'customer';
            
            const user = await User.create({ name, email, password, role: userRole });

            console.log('Admin created:', user);

            const { accessToken, refreshToken } = generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            // If the user is not an admin, reject the request
            res.status(403).json({ message: "Unauthorized, only admins can create admin users" });
        }
    } catch (error) {
        console.log("Error in admin signup controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            role: user.role, // Add role to the payload
        },
        process.env.ACCESS_TOKEN_SECRET, // Make sure to set this in your environment variables
        { expiresIn: "1h" } // Set an expiration time for the token (1 hour, for example)
    );
};

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password, // Password will be hashed in the schema's pre-save hook
        });

        // Save the user to the database
        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser);

        // Send response with the token
        res.status(201).json({
            message: "User created successfully",
            token, // Send the token in the response
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role, // Send the role if needed
            },
        });
    } catch (error) {
        console.error("Error during signup:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// Google signup route
export const googleSignup = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ googleId });

        if (!user) {
            user = await User.create({ name, email, googleId });
        } else {
            return res.status(400).json({ message: "User already exists" });
        }

        const authToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token: authToken });
    } catch (error) {
        console.error('Error during Google signup:', error);
        res.status(500).json({ message: 'Server error during Google signup' });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// Refresh token route
const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { userId },
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' } // Access token expires in 15 minutes
    );

    const refreshToken = jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d' } // Refresh token expires in 7 days
    );

    return { accessToken, refreshToken };
};

// Function to store refresh token in Redis
const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(userId.toString(), refreshToken, 'EX', 7 * 24 * 60 * 60); // Expires in 7 days
};