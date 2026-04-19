/**
 * Fetches geographical data associated with an IP address via ip-api.com
 * Limits query fields internally to minimize payload size.
 *
 * @param {string} ip - The raw IP address
 * @returns {Promise<Object>} Formatted object: { country, city }
 */
const getGeoData = async (ip) => {
    // If running locally, localhost IPs (::1, 127.0.0.1) won't trace. Return fallback.
    if (!ip || ip.includes('127.0.0.1') || ip === '::1') {
        return { country: 'Localhost', city: 'Dev Environment' };
    }

    try {
        // Querying ip-api with explicit field names: status, country, city
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
        
        if (!response.ok) {
            return { country: 'Unknown', city: 'Unknown' };
        }

        const data = await response.json();
        
        if (data.status === 'success') {
            return {
                country: data.country || 'Unknown',
                city: data.city || 'Unknown'
            };
        }

        return { country: 'Unknown', city: 'Unknown' };

    } catch (error) {
        // If the third-party geo API is completely down, fail gracefully so tracking continues
        console.error(`GeoData fetch failed for IP ${ip}: ${error.message}`);
        return { country: 'Unknown', city: 'Unknown' };
    }
};

module.exports = getGeoData;
