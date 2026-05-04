const Link = require('../models/Link');
const Click = require('../models/Click');

const getPublicBaseUrl = (req) => {
    if (process.env.SERVER_URL) return process.env.SERVER_URL;
    return `${req.protocol}://${req.get('host')}`;
};

// @route   GET /api/analytics/overview
// @desc    Get macro-level analytics across all user's links
// @access  Private
const getAccountOverview = async (req, res, next) => {
    try {
        // Find all links belonging to the user
        const links = await Link.find({ userId: req.user.userId }).select('_id');
        const linkIds = links.map(link => link._id);

        if (linkIds.length === 0) {
            return res.status(200).json({
                totalLinks: 0,
                totalClicks: 0,
                uniqueVisitors: 0,
                topPerforming: null,
                clicksByDate: []
            });
        }

        // Aggregate total clicks and uniques
        const totalClicks = await Click.countDocuments({ linkId: { $in: linkIds } });
        const uniqueVisitors = (await Click.distinct('ipHash', { linkId: { $in: linkIds } })).length;

        // Determine top performing link
        const topLinkStats = await Click.aggregate([
            { $match: { linkId: { $in: linkIds } } },
            { $group: { _id: '$linkId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        let topPerforming = null;
        if (topLinkStats.length > 0) {
            const topLinkDoc = await Link.findById(topLinkStats[0]._id).select('title originalUrl shortCode');
            if (topLinkDoc) {
                topPerforming = {
                    title: topLinkDoc.title || topLinkDoc.originalUrl,
                    shortCode: topLinkDoc.shortCode,
                    clicks: topLinkStats[0].count
                };
            }
        }

        // Global sparkline trajectory (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const clicksByDate = await Click.aggregate([
            { 
                $match: { 
                    linkId: { $in: linkIds },
                    clickedAt: { $gte: thirtyDaysAgo }
                } 
            },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } },
                    count: { $sum: 1 }
                } 
            },
            { $sort: { _id: 1 } }
        ]);

        const activeLinks = await Link.countDocuments({ userId: req.user.userId, isActive: true });
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const createdThisMonth = await Link.countDocuments({
            userId: req.user.userId,
            createdAt: { $gte: monthStart }
        });

        const byCountry = await Click.aggregate([{ $match: { linkId: { $in: linkIds } } }, { $group: { _id: '$country', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]);
        const byDevice = await Click.aggregate([{ $match: { linkId: { $in: linkIds } } }, { $group: { _id: '$device', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
        const byBrowser = await Click.aggregate([{ $match: { linkId: { $in: linkIds } } }, { $group: { _id: '$browser', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);

        const latestLinks = await Link.find({ userId: req.user.userId }).sort({ createdAt: -1 }).limit(5);
        const recentLinks = await Promise.all(latestLinks.map(async (link) => {
            const linkClicks = await Click.countDocuments({ linkId: link._id });
            const unique = (await Click.distinct('ipHash', { linkId: link._id })).length;
            const ctr = linkClicks > 0 ? Number(((unique / linkClicks) * 100).toFixed(1)) : 0;

            return {
                id: link._id,
                shortCode: link.shortCode,
                shortUrl: `${getPublicBaseUrl(req)}/${link.shortCode}`,
                destinationUrl: link.originalUrl,
                title: link.title || link.originalUrl,
                tags: link.tags || [],
                status: link.isActive ? 'active' : 'paused',
                totalClicks: linkClicks,
                uniqueVisitors: unique,
                ctr
            };
        }));

        res.status(200).json({
            totalLinks: linkIds.length,
            totalClicks,
            uniqueVisitors,
            topPerforming,
            clicksByDate,
            byCountry,
            byDevice,
            byBrowser,
            stats: {
                totalClicks,
                activeLinks,
                createdThisMonth,
                topPerformer: topPerforming?.title || '—',
                topPerformerClicks: topPerforming ? `${topPerforming.clicks} clicks` : undefined
            },
            recentLinks
        });

    } catch (error) {
        next(error);
    }
};

// @route   GET /api/analytics/:linkId
// @desc    Get exhaustive analytics for a specific link
// @access  Private
const getLinkAnalytics = async (req, res, next) => {
    try {
        const link = await Link.findOne({ _id: req.params.linkId, userId: req.user.userId });
        
        if (!link) {
            return res.status(403).json({ error: 'Unauthorized or link not found' });
        }

        const linkId = link._id;

        // Use Promise.all to run non-blocking parallel extractions
        const [
            totalClicks,
            uniqueVisitors,
            clicksByDate,
            byCountry,
            byDevice,
            byBrowser,
            byOS,
            referrers
        ] = await Promise.all([
            Click.countDocuments({ linkId }),
            Click.distinct('ipHash', { linkId }).then(arr => arr.length),
            
            // Trajectory
            Click.aggregate([
                { $match: { linkId } },
                { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]),

            // Geographics (limit top 10)
            Click.aggregate([
                { $match: { linkId } },
                { $group: { _id: '$country', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Technicals
            Click.aggregate([{ $match: { linkId } }, { $group: { _id: '$device', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            Click.aggregate([{ $match: { linkId } }, { $group: { _id: '$browser', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            Click.aggregate([{ $match: { linkId } }, { $group: { _id: '$os', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
            
            // Referrals (removing direct bounds)
            Click.aggregate([
                { $match: { linkId, referrer: { $ne: null } } },
                { $group: { _id: '$referrer', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        res.status(200).json({
            meta: {
                title: link.title || link.originalUrl,
                shortUrl: `${getPublicBaseUrl(req)}/${link.shortCode}`,
                createdAt: link.createdAt
            },
            stats: {
                totalClicks,
                uniqueVisitors,
                clicksByDate,
                byCountry,
                byDevice,
                byBrowser,
                byOS,
                referrers
            }
        });

    } catch (error) {
        next(error);
    }
};

// @route   GET /api/analytics/:linkId/clicks
// @desc    Get paginated raw click log
// @access  Private
const getRawClickLog = async (req, res, next) => {
    try {
        // Enforce ownership
        const link = await Link.findOne({ _id: req.params.linkId, userId: req.user.userId });
        if (!link) {
            return res.status(403).json({ error: 'Unauthorized or link not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const clicks = await Click.find({ linkId: link._id })
            .select('-ipHash') // Redact the hash entirely for frontend payload security
            .sort({ clickedAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalRowDocs = await Click.countDocuments({ linkId: link._id });

        res.status(200).json({
            clicks,
            pagination: {
                total: totalRowDocs,
                page,
                pages: Math.ceil(totalRowDocs / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAccountOverview,
    getLinkAnalytics,
    getRawClickLog
};
