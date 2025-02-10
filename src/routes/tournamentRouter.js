const express = require('express');
const loginData = require('../models/loginSchema');
const teamSchema = require('../models/teamSchema');
const tournamentData = require('../models/tournamentSchema');
const tournamentRouter = express.Router();


tournamentRouter.post('/create', async (req, res) => {
    try {
        const { name, description, startDate, endDate, prize, turfId } = req.body;

        if (!name || !startDate || !endDate || !turfId) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Missing required fields',
            });
        }

        const tournament = new tournamentData({
            name,
            description,
            startDate,
            endDate,
            prize,
            turfId,
            teams: [],
        });

        const savedTournament = await tournament.save();

        return res.status(201).json({
            success: true,
            error: false,
            data: savedTournament,
            message: 'Tournament created successfully',
        });
    } catch (error) {
        console.error('Error creating tournament:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});

tournamentRouter.get('/all-tournaments', async (req, res) => {
    try {
        const tournaments = await tournamentData
            .find()
            .populate({
                path: 'teams',
                select: 'teamName members captainId',
                populate: {
                    path: 'members captainId',
                    select: 'playerName position',
                    model: 'player_tb',
                },
            })
            .populate('turfId', 'turfName location contact address')
            .sort({ createdAt: -1 });

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'No tournaments found',
            });
        }

        return res.status(200).json({
            success: true,
            error: false,
            data: tournaments,
            message: 'Tournaments retrieved successfully',
        });
    } catch (error) {
        console.error('Error retrieving tournaments:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});

tournamentRouter.post('/register-team', async (req, res) => {
    try {
        const { tournamentId, teamId } = req.body;

        if (!tournamentId || !teamId) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Missing required fields',
            });
        }

        const tournament = await tournamentData.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'Tournament not found',
            });
        }

        if (tournament.teams.includes(teamId)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Team already registered for this tournament',
            });
        }

        tournament.teams.push(teamId);
        await tournament.save();

        return res.status(200).json({
            success: true,
            error: false,
            data: tournament,
            message: 'Team registered successfully',
        });
    } catch (error) {
        console.error('Error registering team:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});

tournamentRouter.get('/delete-tournament/:id', async (req, res) => {
    try {
        const teams = await tournamentData.deleteOne({ _id: req.params.id })

        if (teams.deletedCount == 1) {
            return res.status(404).json({
                success: true,
                error: false,
                message: 'TournamentData deleted',
            });
        }

        return res.status(400).json({
            success: false,
            error: true,
            data: teams,
            message: 'error while deleting',
        });
    } catch (error) {
        console.error('Error retrieving teams:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});



tournamentRouter.get('/tournaments-by-turf/:turfId', async (req, res) => {
    try {
        const { turfId } = req.params;

        // Find all tournaments that match the given turfId
        const tournaments = await tournamentData.find({ turfId })
            .populate({
                path: 'teams',
                select: 'teamName members captainId',
                populate: {
                    path: 'members captainId',
                    select: 'playerName position',
                    model: 'player_tb',
                },
            })
            .populate('turfId', 'turfName location contact address')
            .sort({ createdAt: -1 });

        if (tournaments.length === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'No tournaments found for this Turf',
            });
        }

        return res.status(200).json({
            success: true,
            error: false,
            data: tournaments,
            message: 'Tournaments retrieved successfully',
        });
    } catch (error) {
        console.error('Error retrieving tournaments:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});

tournamentRouter.get('/tournament/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const tournament = await tournamentData
            .findById(id)
            .populate({
                path: 'teams',
                select: 'teamName members captainId',
                populate: {
                    path: 'members captainId',
                    select: 'playerName position',
                    model: 'player_tb',
                },
            })
            .populate('turfId', 'turfName location contact address');

        if (!tournament) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'Tournament not found',
            });
        }

        return res.status(200).json({
            success: true,
            error: false,
            data: tournament,
            message: 'Tournament retrieved successfully',
        });
    } catch (error) {
        console.error('Error retrieving tournament:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});





module.exports = tournamentRouter