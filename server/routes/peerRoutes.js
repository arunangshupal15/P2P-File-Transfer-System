// server/routes/peerRoutes.js
const express = require('express');
const PeerDiscoveryService = require('../controllers/peerDiscovery');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/authMiddleware'); // Import your middleware

// Get the singleton instance
const peerDiscovery = PeerDiscoveryService.getInstance();

router.get('/discover', authMiddleware, (req, res) => {
    try {
        // Ensure we have a user
        if (!req.user) {
            console.error('No user found in authentication');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const username = req.user.username;
        console.log('Starting discovery for SPECIFIC username:', username);

        // Start discovery listener for this user
        peerDiscovery.startDiscoveryListener(username);

        // Broadcast presence
        peerDiscovery.broadcastPresence(username);

        // Return current online peers
        const onlinePeers = peerDiscovery.getOnlinePeers();
        console.log('Online peers found:', onlinePeers);
        
        res.json(onlinePeers);
    } catch (error) {
        //console.error('Discovery endpoint FULL error:', error);
        res.status(500).json({ 
            message: 'Internal server error during peer discovery',
            error: error.toString(),
            stack: error.stack
        });
    }
});

// Add a cleanup route (optional, for manual cleanup)
router.get('/cleanup', (req, res) => {
    try {
        peerDiscovery.cleanup();
        res.json({ message: 'Peer discovery service cleaned up' });
    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({ 
            message: 'Error during peer discovery cleanup',
            error: error.message 
        });
    }
});

module.exports = router;