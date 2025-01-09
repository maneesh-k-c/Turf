const express = require('express');
const loginData = require('../models/loginSchema');
const teamSchema = require('../models/teamSchema');
const teamRouter = express.Router();



teamRouter.post('/create-team', async (req, res) => {
    try {
        const { teamName, captainId } = req.body;

        if (!teamName || !captainId) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Team name and captain are required',
            });
        }

        const existingTeam = await teamSchema.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'A team with this name already exists',
            });
        }


        const newTeam = new teamSchema({
            teamName,
            captainId,
            members: [captainId],
        });

        const savedTeam = await newTeam.save();

        return res.status(201).json({
            success: true,
            error: false,
            data: savedTeam,
            message: 'Team created successfully',
        });
    } catch (error) {
        console.error('Error creating team:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});

teamRouter.get('/all-team', async (req, res) => {
    try {
        const teams = await teamSchema.find()
            .populate('members', 'playerName mobile position availability')
            .populate('pendingRequests', 'playerName mobile position availability')
            .populate('captainLoginId', 'name email ')
            .sort({ createdDate: -1 });

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'No teams found',
            });
        }

        return res.status(200).json({
            success: true,
            error: false,
            data: teams,
            message: 'Teams retrieved successfully',
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

teamRouter.get('/single-team/:id', async (req, res) => {
    try {
        const teams = await teamSchema.findOne({ _id: req.params.id })
            .populate('members', 'playerName mobile position availability')
            .populate('pendingRequests', 'playerName mobile position availability')
            .populate('captainId', 'playerName mobile position ')
            .sort({ createdDate: -1 });

        if (teams.length === 0) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'No teams found',
            });
        }

        return res.status(200).json({
            success: true,
            error: false,
            data: teams,
            message: 'Teams retrieved successfully',
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

teamRouter.get('/delete-team/:id', async (req, res) => {
    try {
        const teams = await teamSchema.deleteOne({ _id: req.params.id })

        if (teams.deletedCount == 1) {
            return res.status(404).json({
                success: true,
                error: false,
                message: 'Team deleted',
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

teamRouter.post('/join-team', async (req, res) => {
    try {

        const { playerId, teamId } = req.body;

        if (!playerId) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Player ID is required',
            });
        }

        const team = await teamSchema.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                error: true,
                message: 'Team not found',
            });
        }

        if (team.members.includes(playerId) || team.pendingRequests.includes(playerId)) {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Player is already a member or has a pending request',
            });
        }

        team.pendingRequests.push(playerId);
        await team.save();

        return res.status(200).json({
            success: true,
            error: false,
            message: 'Request to join the team sent successfully',
        });
    } catch (error) {
        console.error('Error sending join request:', error);
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        });
    }
});

teamRouter.post('/manage-request', async (req, res) => {
    try {
      const { playerId, action ,teamId} = req.body;
  console.log(playerId, action ,teamId);
  
      if (!playerId || !['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: 'Player ID and valid action (approve/reject) are required',
        });
      }
  
      const team = await teamSchema.findById(teamId);
      if (!team) {
        return res.status(404).json({
          success: false,
          error: true,
          message: 'Team not found',
        });
      }
      if (String(team.captainId) !== req.body.captainId) {
        return res.status(403).json({
          success: false,
          error: true,
          message: 'Only the captain can manage requests',
        });
      }
  
      const requestIndex = team.pendingRequests.indexOf(playerId);
      if (requestIndex === -1) {
        return res.status(404).json({
          success: false,
          error: true,
          message: 'Request not found',
        });
      }
  
      if (action === 'approve') {
        team.members.push(playerId);
      }
  
      team.pendingRequests.splice(requestIndex, 1);
      await team.save();
  
      return res.status(200).json({
        success: true,
        error: false,
        message: `Request has been ${action}d successfully`,
      });
    } catch (error) {
      console.error('Error managing join request:', error);
      return res.status(500).json({
        success: false,
        error: true,
        message: 'Internal server error',
      });
    }
});
  





module.exports = teamRouter

