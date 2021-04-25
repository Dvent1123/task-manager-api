const express = require('express')
const router = express.Router()
const roomController = require('../controllers/roomController')


//we can use this get route to initiate the "chat room"

router.route('/')
    .get()

module.exports = router