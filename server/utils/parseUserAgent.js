const UAParser = require('ua-parser-js');

/**
 * Wraps ua-parser-js to extract relevant environment attributes cleanly.
 * 
 * @param {string} userAgentString - The raw string from req.headers['user-agent']
 * @returns {Object} Extracted data: { device, browser, os }
 */
const parseUserAgent = (userAgentString) => {
    if (!userAgentString) {
        return { device: 'unknown', browser: 'Other', os: 'Other' };
    }

    const parser = new UAParser(userAgentString);
    const result = parser.getResult();

    // Normalize Device Types (mobile, desktop, tablet, unknown)
    let deviceType = 'desktop'; // ua-parser returns undefined for standard desktop browsers
    if (result.device.type === 'mobile') deviceType = 'mobile';
    else if (result.device.type === 'tablet') deviceType = 'tablet';
    else if (result.device.type) deviceType = 'unknown';

    // Normalize Browsers (Chrome, Safari, Firefox, Edge, Other)
    const rawBrowser = result.browser.name;
    let browserName = 'Other';
    if (rawBrowser) {
        if (rawBrowser.includes('Chrome')) browserName = 'Chrome';
        else if (rawBrowser.includes('Safari')) browserName = 'Safari';
        else if (rawBrowser.includes('Firefox')) browserName = 'Firefox';
        else if (rawBrowser.includes('Edge')) browserName = 'Edge';
    }

    // Normalize OS (Android, iOS, Windows, macOS, Linux, Other)
    const rawOS = result.os.name;
    let osName = 'Other';
    if (rawOS) {
        if (rawOS.includes('Android')) osName = 'Android';
        else if (rawOS.includes('iOS')) osName = 'iOS';
        else if (rawOS.includes('Windows')) osName = 'Windows';
        else if (rawOS.includes('Mac OS')) osName = 'macOS';
        else if (rawOS.includes('Linux')) osName = 'Linux';
    }

    return {
        device: deviceType,
        browser: browserName,
        os: osName
    };
};

module.exports = parseUserAgent;
