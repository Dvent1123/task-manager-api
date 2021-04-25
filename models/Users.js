const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    roomId: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    job: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Users', userSchema)