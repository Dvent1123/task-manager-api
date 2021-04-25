const jwt = require('jsonwebtoken')

exports.createJWT = ( username, userId,roomId, duration) => {
    const payload = {
        username,
        userId,
        roomId,
        duration
    }

    return jwt.sign(
        payload, 
        process.env.TOKEN_SECRET, 
        { expiresIn: duration }
        )
}