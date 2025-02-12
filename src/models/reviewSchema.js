const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    playerId: { type: mongoose.Types.ObjectId, ref: 'player_tb', required: true },
    turfId: { type: mongoose.Types.ObjectId, ref: 'turf_tb', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const reviewData = mongoose.model('review_tb', reviewSchema);
module.exports = reviewData;
