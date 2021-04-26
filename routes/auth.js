const express = require('express')
const router = express.Router()

const { signup, signin} = require('../controllers/auth')

router.route('/login/signup')
    .post(signup)
router.route('/login/signin')
    .post(signin)


module.exports = router