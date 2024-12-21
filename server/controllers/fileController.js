// server/controllers/fileController.js
const File = require('../models/File');
const User = require('../models/User'); // Import User model
const path = require('path');

// Upload File
exports.uploadFile = async (req, res) => {
    const { description, category, sharedWith } = req.body; // Handle 'sharedWith'
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Process sharedWith: convert usernames to user IDs and add sentAt
        let sharedWithData = [];
        if (sharedWith) {
            const usernames = sharedWith.split(',').map(u => u.trim());
            const users = await User.find({ username: { $in: usernames } });

            if (users.length !== usernames.length) {
                const foundUsernames = users.map(user => user.username);
                const notFound = usernames.filter(u => !foundUsernames.includes(u));
                return res.status(400).json({ message: `Users not found: ${notFound.join(', ')}` });
            }

            sharedWithData = users.map(user => ({
                user: user._id,
                sentAt: new Date()
            }));
        }

        const newFile = new File({
            filename: file.filename,
            originalName: file.originalname,
            description,
            category,
            uploadedBy: req.user._id, // Use the user ID from the authenticated user
            sharedWith: sharedWithData // Assign sharedWith with sentAt
        });

        await newFile.save();
        res.status(201).json({ message: 'File uploaded successfully' });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Files for Logged-In User
exports.getFiles = async (req, res) => {
    try {
        const userId = req.user._id;

        const files = await File.find({
            $or: [
                { uploadedBy: userId },
                { 'sharedWith.user': userId }
            ]
        })
        .populate('uploadedBy', 'username')
        .populate('sharedWith.user', 'username');

        // Filter sharedWith to include only the current user
        const sanitizedFiles = files.map(file => {
            let sharedWith = [];

            if (file.uploadedBy._id.toString() !== userId.toString()) {
                // If the user is not the uploader, include only their own sharedWith entry
                sharedWith = file.sharedWith.filter(sw => sw.user._id.toString() === userId.toString());
            } else {
                // If the user is the uploader, keep all sharedWith entries
                sharedWith = file.sharedWith;
            }

            return {
                _id: file._id,
                filename: file.filename,
                originalName: file.originalName,
                description: file.description,
                category: file.category,
                uploadedBy: file.uploadedBy,
                sharedWith: sharedWith,
                createdAt: file.createdAt
            };
        });

        res.json(sanitizedFiles);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Download File
exports.downloadFile = async (req, res) => {
    const fileId = req.params.id;
    try {
        const file = await File.findById(fileId).populate('uploadedBy', 'username');

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const userId = req.user._id;

        // Check if the user is either the uploader or has been shared the file
        const isUploader = file.uploadedBy._id.toString() === userId.toString();
        const isSharedWith = file.sharedWith.some(sw => sw.user.toString() === userId.toString());

        if (!isUploader && !isSharedWith) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = path.join(__dirname, '../uploads/', file.filename);
        res.download(filePath, file.originalName);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Search Files for Logged-In User
exports.searchFiles = async (req, res) => {
    const { query } = req.query;
    try {
        const userId = req.user._id;

        const files = await File.find({
            $and: [
                {
                    $or: [
                        { uploadedBy: userId },
                        { 'sharedWith.user': userId }
                    ]
                },
                {
                    $or: [
                        { originalName: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                        { category: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
        .populate('uploadedBy', 'username')
        .populate('sharedWith.user', 'username');

        // Filter sharedWith to include only the current user
        const sanitizedFiles = files.map(file => {
            let sharedWith = [];

            if (file.uploadedBy._id.toString() !== userId.toString()) {
                // If the user is not the uploader, include only their own sharedWith entry
                sharedWith = file.sharedWith.filter(sw => sw.user._id.toString() === userId.toString());
            } else {
                // If the user is the uploader, keep all sharedWith entries
                sharedWith = file.sharedWith;
            }

            return {
                _id: file._id,
                filename: file.filename,
                originalName: file.originalName,
                description: file.description,
                category: file.category,
                uploadedBy: file.uploadedBy,
                sharedWith: sharedWith,
                createdAt: file.createdAt
            };
        });

        res.json(sanitizedFiles);
    } catch (error) {
        console.error('Error searching files:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
