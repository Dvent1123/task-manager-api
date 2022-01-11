const Room = require("../models/Room");
const passport = require("passport");

//this simply makes a new room whenever the user registers as an admin
exports.joinRoom = async (io, room, socketID) => {
  io
    .in(room)
    .emit("joined", {
      message: `You've joined ${room} with an ID of ${socketID}`
    });
};

exports.leaveRoom = async (io, room) => {
  io.in(room).emit("left", { message: `You've left ${room}` });
};
