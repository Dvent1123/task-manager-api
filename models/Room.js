const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    userIds: {
        type: Array
    }
})

module.exports = mongoose.model('Rooms', roomSchema)