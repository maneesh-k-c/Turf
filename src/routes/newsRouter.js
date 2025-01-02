const express = require('express');
const newsRouter = express.Router();
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();
const newsData = require('../models/newsSchema')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
const storageImage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'DevagiriTurf',
    },
});
const uploadImage = multer({ storage: storageImage });


newsRouter.post('/add', uploadImage.array('imageUrl', 1), async (req, res) => {
    try {
  


        const news = {
            title: req.body.title,
            news: req.body.news,
            imageUrl: req.files ? req.files.map((file) => file.path) : null,
        };
        const Data = await newsData(news).save();

        if (news) {
            return res.status(200).json({
                success: true,
                error: false,
                data: Data,
                message: 'News posted',
            })
        }
        else {
            return res.status(400).json({
                success: false,
                error: true,
                message: 'Error while posting news',
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: true,
            message: 'Internal server error',
        })
    }
})

newsRouter.get('/view-news', async (req, res) => {
    try {
      const news = await newsData.find()
      if (news[0]) {
        return res.status(200).json({
          success: true,
          error: false,
          data: news,
        })
      } else {
        return res.status(400).json({
          success: false,
          error: true,
          message: 'No data found',
        })
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: true,
        message: 'Internal server error',
      })
    }
  })



module.exports = newsRouter

