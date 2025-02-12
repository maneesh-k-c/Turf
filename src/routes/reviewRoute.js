const express = require('express');
const reviewRouter = express.Router();
const reviewData = require('../models/reviewSchema');

// Add a review
reviewRouter.post('/add', async (req, res) => {
    try {
        const { playerId, turfId, rating, review } = req.body;

        if (!playerId || !turfId || !rating || !review) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newReview = new reviewData({
            playerId,
            turfId,
            rating,
            review
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfully", data: newReview });

    } catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
});

// Get all reviews for a turf
reviewRouter.get('/turf/:turfId', async (req, res) => {
    try {
        const { turfId } = req.params;

        // Fetch all reviews for the given turf
        const reviews = await reviewData.find({ turfId }).populate('playerId', 'playerName');

        if (reviews.length === 0) {
            return res.status(200).json({ message: "No reviews found", totalReviews: 0, averageRating: 0, reviews: [] });
        }

        // Calculate total reviews and average rating
        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(1); // Round to 1 decimal place

       return res.status(200).json({
            totalReviews,
            averageRating,
            reviews
        });

    } catch (error) {
       return res.status(500).json({ message: "Internal server error", error });
    }
});



module.exports = reviewRouter;
