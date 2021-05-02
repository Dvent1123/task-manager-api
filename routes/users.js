const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')


router.route('/users')
    .get(usersController.getUsers)
router.route('/users/user')
    .get(usersController.getUser)

module.exports = router


