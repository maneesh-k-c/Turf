const mongoose = require('mongoose');
const playerSchema = new mongoose.Schema({
    loginId: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
    playerName: { type: String, required: true },
    mobile: { type: String, required: true },
    gender: { type: String, required: true },
    position: { type: String, required: true },
    availability: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: [String]},  
});

var playerData = mongoose.model('player_tb', playerSchema);
module.exports = playerData;
