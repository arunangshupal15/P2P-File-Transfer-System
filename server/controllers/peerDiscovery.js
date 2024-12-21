// server/services/peerDiscovery.js
const dgram = require('dgram');
const os = require('os');

class PeerDiscoveryService {
    constructor(port = 41234) {
        // Singleton pattern
        if (PeerDiscoveryService.instance) {
            return PeerDiscoveryService.instance;
        }

        this.port = port;
        this.server = null;
        this.peers = new Map();
        this.broadcastAddress = this.getBroadcastAddress();
        //this.broadcastAddress = '127.0.0.1';
        this.isListening = false;
        this.cleanupInterval = null;

        // Set the singleton instance
        PeerDiscoveryService.instance = this;
    }

    // Singleton getter
    static getInstance() {
        if (!PeerDiscoveryService.instance) {
            PeerDiscoveryService.instance = new PeerDiscoveryService();
        }
        return PeerDiscoveryService.instance;
    }

    // Get the broadcast address of the current network
    getBroadcastAddress() {
        try {
            const networkInterfaces = os.networkInterfaces();
            for (const interfaceName in networkInterfaces) {
                const interfaces = networkInterfaces[interfaceName];
                for (const iface of interfaces) {
                    if (!iface.internal && iface.family === 'IPv4') {
                        return iface.broadcast || '255.255.255.255';
                    }
                }
            }
        } catch (error) {
            console.error('Error getting broadcast address:', error);
        }
        return '255.255.255.255';
        //return '127.0.0.1';
    }

    // Start listening for peer discovery messages
    startDiscoveryListener(username) {
        // If already listening, just return
        if (this.isListening) {
            return;
        }

        // Close any existing server to prevent duplicate listeners
        if (this.server) {
            try {
                this.server.close();
            } catch (error) {
                console.error('Error closing existing server:', error);
            }
        }

        // Create a new UDP server
        this.server = dgram.createSocket('udp4');

        this.server.bind(this.port, () => {
            try {
                this.server.setBroadcast(true);
                this.isListening = true;
                
                // Remove any existing listeners to prevent duplicates
                this.server.removeAllListeners('message');

                // Listen for discovery messages
                this.server.on('message', (msg, rinfo) => {
                    try {
                        const peerInfo = JSON.parse(msg.toString());
                        
                        // console.log('Received peer message:', {
                        //     receivingUsername: username,
                        //     peerUsername: peerInfo.username,
                        //     peerAddress: rinfo.address,
                        //     peerPort: rinfo.port
                        // });
                        
                            const uniqueKey = `${peerInfo.username}`; // Simplified unique key
                            const existingPeer = this.peers.get(uniqueKey);
                            if (!existingPeer || (Date.now() - existingPeer.lastSeen > 30000)) {
                                this.peers.set(uniqueKey, {
                                    username: peerInfo.username,
                                    ip: rinfo.address,
                                    lastSeen: Date.now()
                                });
        
                                console.log('Added peer:', uniqueKey);
                            }
                    } catch (error) {
                        console.error('Error parsing peer message:', error);
                    }
                });

                // Start cleanup if not already started
                if (!this.cleanupInterval) {
                    this.startPeerCleanup();
                }

                this.broadcastPresence(username);
            } catch (error) {
                console.error('Error setting up discovery listener:', error);
                this.isListening = false;
            }
        });

        // Handle potential binding errors
        this.server.on('error', (err) => {
            console.error('UDP Server error:', err);
            this.server.close();
            this.isListening = false;
            this.server = null;
        });
    }

    broadcastPresence(username) {
        try {
            const message = JSON.stringify({
                username,
                timestamp: Date.now(),
            });
    
            const client = dgram.createSocket('udp4');
            client.bind(() => {
                client.setBroadcast(true);
                client.send(
                    message, 
                    0, 
                    message.length, 
                    this.port, 
                    this.broadcastAddress, 
                    (err) => {
                        if (err) console.error('Broadcast error:', err);
                        client.close();
                    }
                );
            });
        } catch (error) {
            console.error('Error in broadcast presence:', error);
        }
    }
    
    // Modify getOnlinePeers to use a more robust tracking
    getOnlinePeers(maxAgeMs = 30000) {
        try {
            const now = Date.now();
            const uniquePeers = new Map();
            
            for (const [key, peer] of this.peers.entries()) {
                if (now - peer.lastSeen < maxAgeMs) {
                    // Use a combination of username and potentially the unique identifier
                    if (!uniquePeers.has(key)) {
                        uniquePeers.set(key, { 
                            ip: peer.ip,
                            username: peer.username,
                        });
                    }
                }
            }
    
            return Array.from(uniquePeers.values());
        } catch (error) {
            console.error('Error getting online peers:', error);
            return [];
        }
    }

    // Clean up old peers periodically
    startPeerCleanup(intervalMs = 60000) {
        // Clear any existing interval
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Start new cleanup interval
        this.cleanupInterval = setInterval(() => {
            try {
                const now = Date.now();
                for (const [ip, peer] of this.peers.entries()) {
                    if (now - peer.lastSeen > 60000) {
                        this.peers.delete(ip);
                    }
                }
            } catch (error) {
                console.error('Error in peer cleanup:', error);
            }
        }, intervalMs);

        return this.cleanupInterval;
    }

    // Cleanup method to close server and intervals
    cleanup() {
        if (this.server) {
            try {
                this.server.close();
            } catch (error) {
                console.error('Error closing UDP server:', error);
            }
            this.server = null;
        }

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }

        this.isListening = false;
        this.peers.clear();
    }
}

module.exports = PeerDiscoveryService;