const mongoose = require('mongoose')
const User = require('../models/Users')
const Room = require('../models/Room')
const passport = require('passport')
const bcrypt = require('bcrypt')

exports.getUsers = async (req, res) => {
    passport.authenticate('jwt', {session: false}, async (err, user,info) => {
        if(err) {
            console.log(err)
        }
        if(info != undefined) {
            console.log(info.message)
            res.send(info.message)
        }else {
            let usersArray = []
            try{
                usersArray = await User.find({roomId: user.roomId})
                return res.status(201).send({
                    error: false,
                    usersArray
                })
            }catch{
                res.status(500).send({
                    error: true
                })
            }
        }
    }) (req, res)
}

exports.newUser= async (io, userFromServer) => {
    let {username, password, roomId, role, job} = userFromServer

    let errors = [];
    if (!username) {
        errors.push({ message: "User must have a username" });
    }
    if (!password) {
        errors.push({ message: "User must have a password"});
    }
    if (errors.length > 0) {
        result = {success: false,data: false, message: errors[0].message}
        return io.in(roomId).emit('UserAdded', result)
    }


        
        User.findOne({username: username})
            .then(user => {
                if(user){
                    result = {success: false, data: user, message: 'User already exists'}
                    io.in(roomId).emit('UserAdded', result)
                } else {
                    //if you're signingup then you must be an admin
                    //or else the admin will add you to a project
    
                    const user = new User({
                            username: username,
                            roomId: roomId,
                            password: password,
                            role: role,
                            job: job
                        })
    
                    bcrypt.genSalt(10, function(err, salt){
                        bcrypt.hash(password, salt, function(err, hash) {
                            if (err) throw err
                            user.password = hash
                            user.save((err, user) => {
                                if(err) {
                                    result = {success: false, data: err, message: 'Error creating user'}
                                    io.in(roomId).emit('UserAdded', result)
                                }else{
                                    //if user saved successful then add user
                                    //to room with ID
                                    Room.findById(roomId).then(room => {
                                        //if the room exists, which it should then save id in room
                                        if(room) {
                                            room.userIds.push(user._id)
                                            room.save((err, newRoom) => {
                                                if(err){
                                                    result = {success: false, data: err, message: 'Error adding user to room'}
                                                    io.in(roomId).emit('UserAdded', result)
                                                }else{
                                                    result = {success: true, data: user, message: 'Created User!'}
                                                    io.in(roomId).emit('UserAdded', result)
                                                }
                                            })
                                        }
                                    })

                                }   
                            })
                        })
                    })
                }
            })

}

exports.updateUser = async (io, userFromServer) => {
    let {id, username, password, roomId, role, job} = userFromServer
    let result
    
    let errors = [];
    if (!username) {
        errors.push({ message: "User must have a username" });
    }
    if (errors.length > 0) {
        result = {success: false,data: false, message: errors[0].message}
        return io.in(roomId).emit('UserUpdated', result)
    }
    
    User.findById(id)
            .then(user => {
                    user.username = username,
                    user.password = password,
                    user.roomId = roomId,
                    user.role = role,
                    user.job = job
            
                    user.save((err, updatedUser) => {
                        if(err){
                            result = {success: false, data: err, message: 'Error updating user'}
                            io.in(user.roomId).emit('UserUpdated', result)
                        }else{
                            result = {success: true, data: updatedUser, message: 'User updated!'}
                            io.in(user.roomId).emit('UserUpdated', result)
                        }
                    })

                })             
        .catch(err => {
                console.log(err)
        })
}


exports.deleteUser = async (io, id) => {
        let user = await User.findById(id)
        let result
        user.remove((err, deletedUser) => {
            if(err) {
                result = {success: false, error: err}
                console.log(result)            
            }else {
                result = {success: true, data: deletedUser}
                io.in(user.roomId).emit('UserDeleted', result)  
            }            
        })
}
