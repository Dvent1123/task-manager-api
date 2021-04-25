const express = require('express')
const router = express.Router()


router.get('/', async (req, res )=> {
        res.send({"message": "You are in the server"})
    })


module.exports = router