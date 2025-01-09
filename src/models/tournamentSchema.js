const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {type: String,required: true },
  description: {type: String},
  startDate: {type: Date,required: true,},
  endDate: {type: Date,required: true},
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,ref: 'team_tb', 
    }
  ],
  prize: {type: String},
  turfId: { type: mongoose.Schema.Types.ObjectId,ref: 'turf_tb',required: true},
}, { timestamps: true });

var tournamentData = mongoose.model('tournament_tb', tournamentSchema);
module.exports = tournamentData;
