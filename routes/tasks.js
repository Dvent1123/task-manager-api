const { json } = require('body-parser')
const express = require('express')
const router = express.Router()
const tasksController = require('../controllers/tasksController')


router.route('/')
    .get(tasksController.getTasks)

module.exports = router