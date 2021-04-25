const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    createdBy: {
        type: String,
        required: true
    },
    roomId: {
        type: String
    },
    assignedTo: {
        type: String,
        required: true
    },
    status: {
        type: Number, 
        required: true
    },
    desc: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('Tasks', taskSchema)