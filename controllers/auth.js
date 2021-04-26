const User = require('../models/Users')
const Room = require('../models/Room')
const bcrypt = require('bcrypt')
const { createJWT } = require('../utils/auth')

exports.signup = (req, res, next) => {
    let {username, password, password_confirmation} = req.body

    let errors = [];
    if (!username) {
        errors.push({ message: "Username is required" });
    }
    if (!password) {
        errors.push({ message: "Password is required" });
    }
    if (!password_confirmation) {
        errors.push({ message: "Password confirmation is required"});
    }
    if (password != password_confirmation) {
        errors.push({ message: "The password and confirmation do not match" });
    }
    if (errors.length > 0) {
        return res.status(422).send({errors: errors});
    }

    const room = new Room()

    User.findOne({username: username})
        .then(user => {
            if(user){
                return res.status(422).send({errors: [{message: "The user already exists"}]})
            } else {
                //if you're signingup then you must be an admin
                //or else the admin will add you to a project

                const user = new User({
                        username: username,
                        roomId: room._id,
                        password: password,
                        role: 'admin',
                        job: 'admin'
                    })

                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(password, salt, function(err, hash) {
                        if (err) throw err
                        user.password = hash
                        user.save()
                            .then(response => {
                                //pushes the new user id into the room userIds array
                                room.userIds.push(response._id)
                                room.save()
                                res.status(200).send({
                                    success: true,
                                    result: response
                                })
                            })
                            .catch(err => {
                                res.status(500).send({
                                    errors: [{ error: err }]
                                })
                            })
                    })
                })
                .catch(err => {
                    res.status(500).send({
                        errors: [{message: 'Something went wrong'}]
                    })
                })
            }
        })
}

exports.signin = (req, res) => {
    let {username, password} = req.body

     let errors = [];
    if (!username) {
        errors.push({ message: "Username is required" });
    }
     if (!password) {
       errors.push({ message: "Password is required" });
     }
     if (errors.length > 0) {
      return res.status(422).send({ errors: errors });
     }

    User.findOne({ username: username})
        .then(user => {
            if(!user) {
                return res.status(404).send({
                    errors: [{ message: "User was not found" }]
                })
            } else {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        //if password doesn't match
                        if(!isMatch) {
                            return res.status(400).send({errors: [{ message: "Password was incorrect" }]})
                        }
                        //if password does match then create token (payload)
                        //this creates as well as signs the token
                        //it returns payload, secret key, and time it expires in
                        //for id do payload.userId
                        let access_token = createJWT(
                            user.username,
                            user._id,
                            user.roomId,
                            user.role,
                            36000
                        )

                        return res.status(200).send({succes:true, token: access_token})

                    }).catch(err => {
                        res.status(500).send({ errors: err })
                    })
            }
        }).catch(err => {
            res.status(500).send({errors: err})
        })
}

