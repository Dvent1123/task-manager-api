const jwt = require('jsonwebtoken')

exports.createJWT = ( username, userId,roomId,role, duration) => {
    const payload = {
        username,
        userId,
        roomId,
        role,
        duration
    }

    return jwt.sign(
        payload, 
        process.env.TOKEN_SECRET, 
        { expiresIn: duration }
        )
}