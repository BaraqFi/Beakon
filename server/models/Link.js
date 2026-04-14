const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    shortCode: {
        type: String,
        required: [true, 'Short code is required'],
        unique: true,
        index: true
    },
    originalUrl: {
        type: String,
        required: [true, 'Original URL is required'],
        trim: true,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL starting with http:// or https://']
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Null implies a guest-created link
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null // Null for registered users, explicit expiry date for guest links
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Link', LinkSchema);
