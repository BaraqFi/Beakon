/**
 * Fetches geographical data associated with an IP address via ipapi.co
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

    let country = 'Unknown';
    let city = 'Unknown';

    try {
        const response = await fetch(`http://ip-api.com/json/${ip}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.country) {
                country = data.country || 'Unknown';
                city = data.city || data.regionName || 'Unknown';
            }
        }
    } catch (error) {
        console.error(`Primary GeoData (ip-api) fetch failed for IP ${ip}: ${error.message}`);
    }

    // Fallback if the primary returned Unknown or failed
    if (country === 'Unknown') {
        try {
            const key = process.env.IP2LOCATION_KEY;
            const url = key ? `https://api.ip2location.io/?key=${key}&ip=${ip}` : `https://api.ip2location.io/?ip=${ip}`;
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data.country_name && data.country_name !== '-') {
                    country = data.country_name;
                    city = data.city_name || data.region_name || 'Unknown';
                    
                    // Add proxy label if detected
                    if (data.is_proxy) {
                        country += ' (Proxy)';
                        if (city !== 'Unknown') city += ' (Proxy)';
                    }
                }
            }
        } catch (error) {
            console.error(`Secondary GeoData (ip2location) fetch failed for IP ${ip}: ${error.message}`);
        }
    }

    return { country, city };
};

module.exports = getGeoData;
