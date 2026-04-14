const Link = require('../models/Link');
const Click = require('../models/Click');
const hashIP = require('../utils/hashIP');
const parseUserAgent = require('../utils/parseUserAgent');
const getGeoData = require('../utils/getGeoData');

/**
 * Executes asynchronously in the background. Does NOT block the rapid 301 redirection.
 */
const trackClick = async (linkId, req) => {
    try {
        // Extract IP (handling proxies like Railway/Vercel)
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const ip = rawIp ? rawIp.split(',')[0].trim() : 'unknown';
        
        // Obscure IP
        const hashedIp = hashIP(ip);
        
        // Parse UA synchronously
        const { device, browser, os } = parseUserAgent(req.headers['user-agent']);
        
        // Determine referrer
        const referrer = req.headers.referer || req.headers.referrer || null;
        
        // Fetch Geo Data
        const { country, city } = await getGeoData(ip);

        // Save to DB
        await Click.create({
            linkId,
            clickedAt: new Date(),
            country,
            city,
            device,
            browser,
            os,
            referrer,
            ipHash: hashedIp
        });

    } catch (error) {
        // Fail silently so the user never sees tracking architecture errors
        console.error(`Critial background tracking error for Link ID ${linkId}:`, error);
    }
};

// @route   GET /:code
// @desc    Find associated URL and execute instant 301. Spawns tracking async worker.
// @access  Public
const handleRedirect = async (req, res, next) => {
    try {
        const { code } = req.params;

        // Note: Do not return inactive links
        const link = await Link.findOne({ shortCode: code, isActive: true });

        const clientDomain = process.env.CLIENT_URL || 'http://localhost:3000';

        if (!link) {
            return res.redirect(301, `${clientDomain}/404`);
        }

        if (link.expiresAt && link.expiresAt < new Date()) {
            // Guest link expired
            return res.redirect(301, `${clientDomain}/expired`);
        }

        // Fire & Forget background tracking. We do NOT use `await` here. We want immediate speed.
        trackClick(link._id, req);

        // Immediate 301
        return res.redirect(301, link.originalUrl);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleRedirect
};
