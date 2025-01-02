const mongoose = require('mongoose');
const newSchema = new mongoose.Schema({
    title: { type: String, required: true },
    news: { type: String, required: true },
    imageUrl: { type: [String]},  
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

var newsData = mongoose.model('news_tb', newSchema);
module.exports = newsData;
