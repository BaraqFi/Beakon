const { customAlphabet } = require('nanoid');
const Link = require('../models/Link');

// Alphabet avoids ambiguous characters like l, 1, O, 0
const alphabet = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6);

const generateShortCode = async () => {
    let code;
    let isUnique = false;
    
    // Safety break to prevent infinite loops, though practically impossible at 6 chars ~56 billion combos
    let attempts = 0;

    while (!isUnique && attempts < 10) {
        code = nanoid();
        const existing = await Link.findOne({ shortCode: code });
        if (!existing) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate a unique short code');
    }

    return code;
};

module.exports = generateShortCode;
