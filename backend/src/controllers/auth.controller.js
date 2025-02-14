import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Function to create default admin
const createDefaultAdmin = async () => {
    const adminExists = await User.findOne({ email: 'ayush.1429agr@gmail.com' });
    if (!adminExists) {
        // Define the default values for the missing fields
        const defaultCity = 'SomeCity';  // Replace with your desired city
        const defaultCollegeName = 'SomeCollege';  // Replace with your desired college name
        const defaultEnrollmentNumber = '123456789';  // Replace with your desired enrollment number

        const admin = await User.create({
            name: 'Ayush',
            email: 'ayush.1429agr@gmail.com',
            password: '3264623', // This will be hashed automatically when saved
            role: 'admin', // Admin role for this user
            city: defaultCity,
            collegeName: defaultCollegeName,
            enrollmentNumber: defaultEnrollmentNumber
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
// signup controller
// signup controller
export const signup = async (req, res) => {
    try {
        console.log("Received data:", req.body);  // Log request data
        
        const { name, email, password, city, collegeName, enrollmentNumber } = req.body;

        if (!city || !collegeName || !enrollmentNumber) {
            return res.status(400).json({
                message: "City, College Name, and Enrollment Number are required"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const newUser = new User({
            name,
            email,
            password,
            city,
            collegeName,
            enrollmentNumber,
        });

        await newUser.save();

        const { accessToken, refreshToken } = generateTokens(newUser._id);

        res.status(201).json({
            message: "User created successfully",
            token: accessToken,
            user: newUser
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
