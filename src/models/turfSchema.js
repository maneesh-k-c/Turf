const mongoose = require('mongoose');

const turfSchema = new mongoose.Schema({
    loginId: { type: mongoose.Types.ObjectId, ref: 'login_tb' },
    turfName: { type: String, required: true },
    location: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    fair: { type: String, required: true },
    imageUrl: { type: [String] },
    documentUrl: { type: [String], required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    about: { type: String, required: false },
});

var turfData = mongoose.model('turf_tb', turfSchema);
module.exports = turfData;
