const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'] // Will be hashed via bcrypt
    },
    name: {
        type: String,
        trim: true
    },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Avoid bringing back passwordHash accidentally in queries
UserSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.passwordHash;
    return user;
};

module.exports = mongoose.model('User', UserSchema);
