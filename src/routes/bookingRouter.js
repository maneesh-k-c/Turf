const express = require('express');
const mongoose = require('mongoose');
const bookingData = require('../models/bookingSchema'); // Adjust the path as necessary
const turfData = require('../models/turfSchema'); // Adjust the path as necessary
const playerData = require('../models/playerSchema'); // Adjust the path as necessary

const router = express.Router();

// Player Booking API
router.post('/book_turf', async (req, res) => {
    const { turfId, playerId, bookingDate, startTime, endTime, payment } = req.body;

    try {
        // Check if the turf and player exist
        const turf = await turfData.findById(turfId);
        const player = await playerData.findById(playerId);

        if (!turf || !player) {
            return res.status(404).json({ message: 'Turf or Player not found' });
        }

        // Check for overlapping bookings
        const overlappingBooking = await bookingData.findOne({
            turfId,
            bookingDate,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            ],
        });

        if (overlappingBooking) {
            return res.status(400).json({ message: 'The selected time slot is already booked' });
        }

        // Create a new booking
        const newBooking = new bookingData({
            turfId,
            playerId,
            bookingDate,
            startTime,
            endTime,
            payment, // Include payment details
        });

        // Save the booking to the database
        await newBooking.save();

        res.status(201).json({ message: 'Booking successful', booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: 'Error booking turf', error: error.message });
    }
});

// API to Fetch All Bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await bookingData.find()
            .populate('turfId', 'turfName location') // Populate turf details
            .populate('playerId', 'playerName mobile'); // Populate player details

        res.status(200).json({ message: 'All bookings fetched successfully', bookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// API to Fetch a Specific Booking by ID
router.get('/bookings/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await bookingData.findById(id)
            .populate('turfId', 'turfName location') // Populate turf details
            .populate('playerId', 'playerName mobile'); // Populate player details

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking fetched successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching booking', error: error.message });
    }
});

// API to Fetch Bookings for a Specific Player
router.get('/bookings/player/:playerId', async (req, res) => {
    const { playerId } = req.params;

    try {
        // Check if the player exists
        const player = await playerData.findById(playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        // Fetch bookings for the specific player
        const bookings = await bookingData.find({ playerId })
            .populate('turfId', 'turfName location') // Populate turf details
            .populate('playerId', 'playerName mobile'); // Populate player details

        res.status(200).json({ message: 'Bookings fetched successfully', bookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings for player', error: error.message });
    }
});


// API to Fetch Bookings for a Specific Turf
router.get('/bookings/turf/:turfId', async (req, res) => {
    const { turfId } = req.params;

    try {
        // Check if the turf exists
        console.log(turfId);
        const turf = await turfData.findById(turfId);
        if (!turf) {
            return res.status(404).json({ message: 'Turf not found' });
        }

        // Fetch bookings for the specific turf
        const bookings = await bookingData.find({ turfId })
            .populate('turfId', 'turfName location') // Populate turf details
            .populate('playerId', 'playerName mobile'); // Populate player details

        res.status(200).json({ message: 'Bookings fetched successfully', bookings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings for turf', error: error.message });
    }
});

// API to Update Booking Status
router.put('/bookings/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        // Check if the booking exists
        const booking = await bookingData.findById(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Validate the status value
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Update the booking status
        booking.status = status;
        await booking.save();

        res.status(200).json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error: error.message });
    }
});




module.exports = router;