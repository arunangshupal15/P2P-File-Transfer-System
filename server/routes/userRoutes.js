// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const fs = require("fs");
const path = require("path");
const  File  = require('../models/File'); // Assume File is the model for file metadata

router.post('/register', registerUser);
router.post('/login', loginUser);

router.post("/logout", async (req, res) => {
    try {
        //const { username, password } = req.body;
        const userId = req.body.userId; // Assuming the user's ID is sent in the request
        const userFiles = await File.find({ uploadedBy: userId });

        for (const file of userFiles) {
            const filePath = path.join(__dirname, "uploads", file.filename);
            
            // Delete file from the server
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Remove file metadata from the database
        await File.deleteMany({ uploadedBy: userId });

        res.status(200).send({ message: "Logged out and files deleted successfully" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send({ error: "Failed to log out and delete files" });
    }
});

module.exports = router;
