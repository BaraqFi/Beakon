const crypto = require('crypto');

/**
 * Irreversibly hashes an IP address using SHA-256 to ensure raw IPs are never stored in the database.
 * This guarantees privacy while still allowing us to count "unique visitors" logically for a specific link.
 * 
 * @param {string} ip - The raw IP address string
 * @returns {string} The SHA-256 hex hash
 */
const hashIP = (ip) => {
    if (!ip) return 'unknown_ip_hash';
    // Incorporate a secondary salt to prevent rainbow table attacks on ipv4 spaces
    const salt = process.env.IP_HASH_SALT || 'beakon_tracking_salt_9124';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
};

module.exports = hashIP;
