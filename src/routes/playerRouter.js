const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const playerData = require('../models/playerSchema'); // Adjust the path as needed

// Configure Cloudinary Storage
const storageImage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'DevagiriTurf',
        format: async (req, file) => 'png', // Adjust format if needed
        public_id: (req, file) => `player_${Date.now()}`,
    },
});

const uploadImage = multer({ storage: storageImage });

// Edit Player API with Image Upload
router.put('/:id', uploadImage.single('imageUrl'), async (req, res) => {
    try {
        const playerId = req.params.id;

        // Check if the player exists
        const player = await playerData.findById(playerId);
        if (!player) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'Player not found',
            });
        }

        // Extract update fields from request
        const updateData = {
            playerName: req.body.playerName,
            gender: req.body.gender,
            mobile: req.body.mobile,
            position: req.body.position,
            availability: req.body.availability,
            location: req.body.location,
        };

        // Check if an image file is uploaded
        if (req.file) {
            updateData.imageUrl = req.file.path; // Save Cloudinary URL
        }

        // Update player details in DB
        const updatedPlayer = await playerData.findByIdAndUpdate(playerId, updateData, { new: true });

        res.status(200).json({
            success: true,
            error: false,
            data: updatedPlayer,
            message: 'Player profile updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: true,
            message: 'Error updating player',
            error: error.message,
        });
    }
});

module.exports = router;
