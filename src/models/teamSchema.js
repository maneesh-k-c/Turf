const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  teamName: {type: String,required: true},
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'player_tb', 
      required: true,
    }
  ],  
  pendingRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'player_tb',
    },
  ],
  status: {type: String,default: 'open'},
  captainId: {type: mongoose.Schema.Types.ObjectId,ref: 'player_tb',required: true},
  createdDate: {type: Date,default: Date.now},
}, { timestamps: true });

module.exports = mongoose.model('team_tb', teamSchema);
