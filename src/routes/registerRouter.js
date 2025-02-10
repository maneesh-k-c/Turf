const express = require('express');
const registerRouter = express.Router();
const turfData = require('../models/turfSchema');
const loginData = require('../models/loginSchema');
const playerData = require('../models/playerSchema');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
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
        latitude: req.body.latitude,  
        longitude: req.body.longitude, 
        fair: req.body.fair,
        documentUrl: req.files ? req.files.map((file) => file.path) : null,
        about: req.body.about || '',
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
        message: 'Turf Deleted',
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

registerRouter.get('/view-turfs', async (req, res) => {
  try {
    const turf = await turfData.aggregate([
      {
        '$lookup': {
          'from': 'login_tbs',
          'localField': 'loginId',
          'foreignField': '_id',
          'as': 'login'
        }
      },
      {
        '$unwind': {
          'path': '$login'
        }
      },
      {
        '$group': {
          '_id': '$_id',
          'loginId': { '$first': '$login._id' },
          'email': { '$first': '$login.email' },
          'status': { '$first': '$login.status' },
          'turfName': { '$first': '$turfName' },
          'location': { '$first': '$location' },
          'contact': { '$first': '$contact' },
          'address': { '$first': '$address' },
          'fair': { '$first': '$fair' },
          'imageUrl': { '$first': '$imageUrl' },
          'documentUrl': { '$first': '$documentUrl' },
          'latitude': { '$first': '$latitude' },
          'longitude': { '$first': '$longitude' },
        }
      }
    ])
    if (turf[0]) {
      return res.status(200).json({
        success: true,
        error: false,
        data: turf,
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

registerRouter.get('/view-single-turf/:login_id', async (req, res) => {
  try {
    const turf = await turfData.findOne({loginId:req.params.login_id})
    if (turf) {
      return res.status(200).json({
        success: true,
        error: false,
        data: turf,
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

registerRouter.put('/turf/:turfId', uploadImage.array('imageUrl', 1), async (req, res) => {
  try {
    const { turfId } = req.params;
    const turf = await turfData.findById(turfId);
    if (!turf) {
      return res.status(404).json({
        success: false,
        error: true,
        message: 'Turf not found.',
      });
    }
    const updatedFields = {
      turfName: req.body.turfName || turf.turfName,
      location: req.body.location || turf.location,
      contact: req.body.contact || turf.contact,
      address: req.body.address || turf.address,
      fair: req.body.fair || turf.fair,
      imageUrl: req.files ? req.files.map((file) => file.path) : turf.imageUrl,
    };

    if (req.body.turfName && req.body.turfName !== turf.turfName) {
      const existingTurf = await turfData.findOne({ turfName: req.body.turfName });
      if (existingTurf) {
        return res.status(400).json({
          success: false,
          error: true,
          message: 'Turf with that name already exists.',
        });
      }
    }

    if (req.body.contact && req.body.contact !== turf.contact) {
      const existingNumber = await turfData.findOne({ contact: req.body.contact });
      if (existingNumber) {
        return res.status(400).json({
          success: false,
          error: true,
          message: 'Contact number already exists.',
        });
      }
    }

    const updatedTurf = await turfData.findByIdAndUpdate(turfId, updatedFields, { new: true });

    return res.status(200).json({
      success: true,
      error: false,
      data: updatedTurf,
      message: 'Turf details updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: 'Internal server error',
    });
  }
});


// =====================player registration==================================
registerRouter.post('/player', uploadImage.array('imageUrl', 1), async (req, res) => {
  try {
    const existingUser = await loginData.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: true,
        message: 'Player with this email already exists.',
      })
    }
    console.log('log', req.body);
    const existingNumber = await playerData.findOne({ mobile: req.body.mobile });
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
      role: 'player',
      status: 'approved'
    };

    console.log('log', log);

    const result = await loginData(log).save();
    if (result) {
      const turf = {
        loginId: result._id,
        playerName: req.body.playerName,
        gender: req.body.gender,
        mobile: req.body.mobile,
        position: req.body.position   ,
        availability: req.body.availability,
        location: req.body.location,
        imageUrl: req.files ? req.files.map((file) => file.path) : null,
      };
      console.log('turf',turf);
      const Data = await playerData(turf).save();

      return res.status(200).json({
        success: true,
        error: false,
        data: Data,
        message: 'Player registration completed',
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

registerRouter.get('/delete-player/:login_id', async (req, res) => {
  try {
    const id = req.params.login_id
    const update = await loginData.deleteOne({ _id: id })
    if (update.deletedCount == 1) {
      const deletePlayer = await playerData.deleteOne({loginId:id})
      return res.status(200).json({
        success: true,
        error: false,
        message: 'player Deleted',
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

registerRouter.get('/view-single-player/:login_id', async (req, res) => {
  try {
    const turf = await playerData.findOne({loginId:req.params.login_id})
    if (turf) {
      return res.status(200).json({
        success: true,
        error: false,
        data: turf,
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

registerRouter.get('/view-all-players', async (req, res) => {
  try {
    const turf = await playerData.find()
    if (turf) {
      return res.status(200).json({
        success: true,
        error: false,
        data: turf,
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

module.exports = registerRouter


