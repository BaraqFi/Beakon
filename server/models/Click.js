const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
    linkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Link',
        required: true,
        index: true // Essential for fast per-link aggregation
    },
    clickedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    country: {
        type: String,
        default: 'Unknown'
    },
    city: {
        type: String,
        default: 'Unknown'
    },
    device: {
        type: String,
        enum: ['mobile', 'desktop', 'tablet', 'unknown'],
        default: 'unknown'
    },
    browser: {
        type: String,
        default: 'Other'
    },
    os: {
        type: String,
        default: 'Other'
    },
    referrer: {
        type: String,
        default: null
    },
    ipHash: {
        type: String,
        required: true // SHA-256 requirement enforced by aiRules
    }
});

module.exports = mongoose.model('Click', ClickSchema);
