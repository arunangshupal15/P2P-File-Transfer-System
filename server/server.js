// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRoutes');
// Add this line with other route imports
const peerRoutes = require('./routes/peerRoutes');
const path = require('path'); // Import path module

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for testing purposes
    credentials: true, // If you need to allow cookies to be sent along with requests
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Serve static files from the React app (if you're serving the React app from Express)
app.use(express.static(path.join(__dirname, '../client/build'))); // Adjust the path to your client build directory

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

// Add this line with other route uses
app.use('/api/peers', peerRoutes);

// Fallback to serve the React app for any unmatched routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html')); // Adjust the path accordingly
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => { // Listen on all network interfaces
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}).catch((err) => {
    console.error(err);
});
