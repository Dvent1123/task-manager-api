const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/Users')




const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = process.env.TOKEN_SECRET

passport.use('jwt',
        new JwtStrategy(opts, (jwt_payload, done) => {
            //the payload is sent here which should have the id of the user
            User.findById(jwt_payload.userId)
                .then(user => {
                    if(user) {
                        //if the user is found the return the user
                        return done(null, user)
                    }
                    //if the user is not found then return false
                    return done(null, false)
                })
                .catch(err => console.log(err))
        })
)