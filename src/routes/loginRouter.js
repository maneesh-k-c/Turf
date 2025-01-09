const express = require('express');
const loginData = require('../models/loginSchema');
const playerData = require('../models/playerSchema');
const loginRouter = express.Router();

require('dotenv').config();

loginRouter.post('/', async (req, res, next) => {
    try {
console.log(req.body);

if (req.body.email && req.body.password) {
    
    const oldUser = await loginData.findOne({
        email: req.body.email,
    });
    console.log(oldUser);
            if (!oldUser) {
                return res.status(400).json({
                    Success: false,
                    Error: true,
                    Message: 'You have to Register First',
                });
            }

            if (oldUser.status=='pending') {
                return res.json({
                    Success: false,
                    Error: true,
                    Message: 'Waiting for admins approval',
                });
            }
            if (oldUser.status=='rejected') {
                return res.json({
                    Success: false,
                    Error: true,
                    Message: 'Rejected by admin',
                });
            }

           
            if (req.body.password!=oldUser.password) {
                return res.status(400).json({
                    Success: false,
                    Error: true,
                    Message: 'Password Incorrect',
                });
            }
            const playerDetails = await playerData.findOne({loginId:oldUser._id})

            return res.status(200).json({
                success: true,
                error: false,
                playerId:playerDetails._id,
                loginId: oldUser._id,
                email: oldUser.email,
                role: oldUser.role,
            });
        } else {
            return res.status(400).json({
                Success: false,
                Error: true,
                Message: 'All field are required',
            });
        }
    } catch (error) {
        return res.json({
            Success: false,
            Error: true,
            Message: 'Something went wrong',
        });
    }
});

module.exports = loginRouter

