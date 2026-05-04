const User = require('../models/User');
const Link = require('../models/Link');
const Click = require('../models/Click');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const setTokenCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    res.cookie('jwt', token, {
        httpOnly: true,                  // Cannot be accessed via client JS
        secure: process.env.NODE_ENV === 'production', // true if prod
        sameSite: 'Lax',                 // Protects against CSRF
        maxAge: 24 * 60 * 60 * 1000      // 24 hours in ms
    });
};

const register = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Authentication is not configured' });
        }

        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            passwordHash,
            name
        });

        // Set JWT HTTP-Only Cookie
        setTokenCookie(res, user._id);

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user._id, email: user.email, name: user.name, plan: user.plan }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ error: 'Authentication is not configured' });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set JWT HTTP-Only Cookie
        setTokenCookie(res, user._id);

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, email: user.email, name: user.name, plan: user.plan }
        });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.cookie('jwt', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ message: 'User logged out' });
};

const getMe = async (req, res, next) => {
    try {
        // req.user.userId comes from verifyToken middleware
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            user: { id: user._id, email: user.email, name: user.name, plan: user.plan }
        });
    } catch (error) {
        next(error);
    }
};

const updateMe = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        const updateFields = {};

        if (name !== undefined) {
            updateFields.name = String(name).trim();
        }

        if (email !== undefined) {
            const normalizedEmail = String(email).trim().toLowerCase();
            const emailRegex = /^\S+@\S+\.\S+$/;
            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({ error: 'Please provide a valid email address' });
            }

            const existing = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: req.user.userId }
            });
            if (existing) {
                return res.status(409).json({ error: 'An account with this email already exists' });
            }

            updateFields.email = normalizedEmail;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                plan: updatedUser.plan
            }
        });
    } catch (error) {
        next(error);
    }
};

const deleteMe = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const userLinks = await Link.find({ userId }).select('_id');
        const linkIds = userLinks.map((link) => link._id);

        if (linkIds.length > 0) {
            await Click.deleteMany({ linkId: { $in: linkIds } });
            await Link.deleteMany({ _id: { $in: linkIds } });
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.cookie('jwt', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    updateMe,
    deleteMe
};
