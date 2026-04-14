const Link = require('../models/Link');
const Click = require('../models/Click');
const generateShortCode = require('../utils/generateShortCode');

const getPublicBaseUrl = (req) => {
    if (process.env.SERVER_URL) return process.env.SERVER_URL;
    return `${req.protocol}://${req.get('host')}`;
};

const normalizeAndValidateUrl = (value) => {
    let parsed;
    try {
        parsed = new URL(value);
    } catch {
        return null;
    }
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
};

const isValidCustomCode = (code) => /^[A-Za-z0-9_-]{4,32}$/.test(code);

// @route   GET /api/links
// @desc    Get all links for logged-in user
// @access  Private
const getLinks = async (req, res, next) => {
    try {
        const links = await Link.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        
        // We also want to grab aggregate stats per link to fulfill the dashboard's needs immediately (CTR, Clicks, Unique)
        // If the number of links scales massively, this should be paginated, but for now we aggregate.
        
        const enhancedLinks = await Promise.all(links.map(async (link) => {
            const totalClicks = await Click.countDocuments({ linkId: link._id });
            const uniqueVisitors = (await Click.distinct('ipHash', { linkId: link._id })).length;
            
            return {
                id: link._id,
                shortUrl: `${getPublicBaseUrl(req)}/${link.shortCode}`,
                shortCode: link.shortCode,
                destinationUrl: link.originalUrl,
                title: link.title || link.originalUrl,
                tags: link.tags,
                status: link.isActive ? 'active' : 'paused',
                totalClicks,
                uniqueVisitors,
                ctr: totalClicks > 0 ? ((uniqueVisitors / totalClicks) * 100).toFixed(1) : 0,
                createdAt: link.createdAt.toISOString().split('T')[0]
            };
        }));

        res.status(200).json(enhancedLinks);
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/links
// @desc    Create a new link (Authenticated)
// @access  Private
const createLink = async (req, res, next) => {
    try {
        const { originalUrl, title, tags, customCode } = req.body;

        if (!originalUrl) {
            return res.status(400).json({ error: 'Original URL is required' });
        }

        const safeUrl = normalizeAndValidateUrl(originalUrl);
        if (!safeUrl) {
            return res.status(400).json({ error: 'Please provide a valid destination URL' });
        }

        if (customCode && !isValidCustomCode(customCode)) {
            return res.status(400).json({ error: 'Custom code must be 4-32 chars and use letters, numbers, _ or -' });
        }

        if (tags && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || tag.length > 40))) {
            return res.status(400).json({ error: 'Tags must be an array of short strings' });
        }

        let shortCode;
        if (customCode) {
            const existing = await Link.findOne({ shortCode: customCode });
            if (existing) {
                return res.status(409).json({ error: 'This custom code is already taken' });
            }
            shortCode = customCode;
        } else {
            shortCode = await generateShortCode();
        }

        const link = await Link.create({
            shortCode,
            originalUrl: safeUrl,
            title: typeof title === 'string' ? title.trim() : '',
            tags: tags || [],
            userId: req.user.userId,
            isActive: true,
            expiresAt: null
        });

        res.status(201).json({ link });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/links/guest
// @desc    Create a new link (Unauthenticated / Guest)
// @access  Public
const createGuestLink = async (req, res, next) => {
    try {
        const { originalUrl, title, tags } = req.body;

        if (!originalUrl) {
            return res.status(400).json({ error: 'Original URL is required' });
        }

        const safeUrl = normalizeAndValidateUrl(originalUrl);
        if (!safeUrl) {
            return res.status(400).json({ error: 'Please provide a valid destination URL' });
        }

        if (tags && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || tag.length > 40))) {
            return res.status(400).json({ error: 'Tags must be an array of short strings' });
        }

        const shortCode = await generateShortCode();

        const link = await Link.create({
            shortCode,
            originalUrl: safeUrl,
            title: typeof title === 'string' ? title.trim() : '',
            tags: tags || [],
            userId: null, // Critical: explicitly unowned
            isActive: true,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 day expiry
        });

        res.status(201).json({ link });
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/links/claim
// @desc    Claim guest links onto an authenticated account
// @access  Private
const claimGuestLinks = async (req, res, next) => {
    try {
        const { shortCodes } = req.body;

        if (!shortCodes || !Array.isArray(shortCodes) || shortCodes.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of short codes to claim' });
        }

        if (shortCodes.some((code) => typeof code !== 'string' || code.length > 64)) {
            return res.status(400).json({ error: 'Invalid short codes payload' });
        }

        // Only find links that have no userId (preventing stealing)
        const result = await Link.updateMany(
            { 
                shortCode: { $in: shortCodes },
                userId: null 
            },
            { 
                $set: { 
                    userId: req.user.userId,
                    expiresAt: null // Remove the 30-day guest expiry
                }
            }
        );

        res.status(200).json({ 
            message: 'Links successfully claimed',
            claimed: result.modifiedCount 
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/links/:id
// @desc    Get a single link
// @access  Private
const getLink = async (req, res, next) => {
    try {
        const link = await Link.findOne({ _id: req.params.id, userId: req.user.userId });
        
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        res.status(200).json({ link });
    } catch (error) {
        next(error);
    }
};

// @route   PATCH /api/links/:id
// @desc    Update a link (title, tags, isActive)
// @access  Private
const updateLink = async (req, res, next) => {
    try {
        const { title, tags, isActive } = req.body;
        
        // Prevent malicious mass-assignment. Only these three schema nodes are modifiable.
        const updateFields = {};
        if (title !== undefined) {
            if (typeof title !== 'string') {
                return res.status(400).json({ error: 'Title must be a string' });
            }
            updateFields.title = title.trim();
        }
        if (tags !== undefined) {
            if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string' || tag.length > 40)) {
                return res.status(400).json({ error: 'Tags must be an array of short strings' });
            }
            updateFields.tags = tags;
        }
        if (isActive !== undefined) {
            if (typeof isActive !== 'boolean') {
                return res.status(400).json({ error: 'isActive must be a boolean' });
            }
            updateFields.isActive = isActive;
        }

        const link = await Link.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: updateFields }, 
            { new: true, runValidators: true }
        );

        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        res.status(200).json({ link });
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/links/:id
// @desc    Delete a link and its cascade data
// @access  Private
const deleteLink = async (req, res, next) => {
    try {
        const link = await Link.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!link) {
            return res.status(404).json({ error: 'Link not found' });
        }

        // Cascade delete all clicks associated with this link
        await Click.deleteMany({ linkId: link._id });
        await link.deleteOne();

        res.status(200).json({ message: 'Link and associated analytics deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLinks,
    createLink,
    createGuestLink,
    claimGuestLinks,
    getLink,
    updateLink,
    deleteLink
};
