const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    turfId: { type: mongoose.Types.ObjectId, ref: 'turf_tb', required: true },
    playerId: { type: mongoose.Types.ObjectId, ref: 'player_tb', required: true },
    bookingDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    payment:{ type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

var bookingData = mongoose.model('booking_tb', bookingSchema);
module.exports = bookingData;