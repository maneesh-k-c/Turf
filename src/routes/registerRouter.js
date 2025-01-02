const express = require('express');
const registerRouter = express.Router();
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const turfData = require('../models/turfSchema');
const loginData = require('../models/loginSchema');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

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



// =====================turf registration==================================
registerRouter.post('/turf', uploadImage.array('documentUrl', 1), async (req, res) => {
  try {
    const existingTurf = await turfData.findOne({ turfName: req.body.turfName });
    if (existingTurf) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Turf with that name already exists.',
      })
    }
    console.log('log', req.body);
    const existingNumber = await turfData.findOne({ contact: req.body.contact });
    if (existingNumber) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Contact number already exists.',
      })
    }

    let log = {
      email: req.body.email,
      password: req.body.password,
      role: 'turf',
      status: 'pending'
    };

    console.log('log', log);

    const result = await loginData(log).save();
    if (result) {
      const turf = {
        loginId: result._id,
        turfName: req.body.turfName,
        location: req.body.location,
        contact: req.body.contact,
        address: req.body.address,
        fair: req.body.fair,
        documentUrl: req.files ? req.files.map((file) => file.path) : null,
      };
      const Data = await turfData(turf).save();

      return res.status(200).json({
        success: true,
        error: false,
        data: Data,
        message: 'Turf registration completed',
      })
    } else {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Error while registration',
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


registerRouter.get('/approve-turf/:login_id', async (req, res) => {
  try {
    const id = req.params.login_id
    const update = await loginData.updateOne({ _id: id }, { $set: { status: 'approved' } })
    if (update.modifiedCount == 1) {
      return res.status(200).json({
        success: true,
        error: false,
        message: 'Approved',
      })
    } else {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Error while Approving',
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

registerRouter.get('/reject-turf/:login_id', async (req, res) => {
  try {
    const id = req.params.login_id
    const update = await loginData.updateOne({ _id: id }, { $set: { status: 'rejected' } })
    if (update.modifiedCount == 1) {
      return res.status(200).json({
        success: true,
        error: false,
        message: 'Rejected',
      })
    } else {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Error while Approving',
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

registerRouter.get('/delete-turf/:login_id', async (req, res) => {
  try {
    const id = req.params.login_id
    const update = await loginData.deleteOne({ _id: id })
    if (update.deletedCount == 1) {
      return res.status(200).json({
        success: true,
        error: false,
        message: 'Turf Delated',
      })
    } else {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Error while Deleting',
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

module.exports = registerRouter


