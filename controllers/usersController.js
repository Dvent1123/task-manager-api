const mongoose = require("mongoose");
const User = require("../models/Users");
const Room = require("../models/Room");
const passport = require("passport");
const bcrypt = require("bcrypt");

exports.getUsers = async (req, res) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log(err);
    }
    if (info != undefined) {
      console.log(info.message);
      res.send(info.message);
    } else {
      let usersArray = [];
      try {
        usersArray = await User.find({ roomId: user.roomId });
        return res.status(201).send({
          error: false,
          usersArray
        });
      } catch {
        res.status(500).send({
          error: true
        });
      }
    }
  })(req, res);
};

exports.getUser = async (req, res) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log(err);
    }
    if (info != undefined) {
      console.log(info.message);
      res.send(info.message);
    } else {
      try {
        let currentUser = await User.findById(user._id);
        return res.status(201).send({
          error: false,
          currentUser
        });
      } catch {
        res.status(500).send({
          error: true
        });
      }
    }
  })(req, res);
};

exports.newUser = async (io, userFromServer, people) => {
  let { username, password, roomId, role, job, currentUser } = userFromServer;
  let errors = [];
  if (!username) {
    errors.push({ message: "User must have a username" });
  }
  if (!password) {
    errors.push({ message: "User must have a password" });
  }
  if (errors.length > 0) {
    result = { success: false, data: false, message: errors[0].message };
    return io.to(people[currentUser]).emit("UserAdded", result);
  }

  User.findOne({ username: username }).then(user => {
    if (user) {
      result = { success: false, data: user, message: "User already exists" };
      return io.to(people[currentUser]).emit("UserAdded", result);
    } else {
      //if you're signingup then you must be an admin
      //or else the admin will add you to a project

      const user = new User({
        username: username,
        roomId: roomId,
        password: password,
        role: role,
        job: job
      });

      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) throw err;
          user.password = hash;
          user.save((err, user) => {
            if (err) {
              result = {
                success: false,
                data: err,
                message: "Error creating user"
              };
              return io.to(people[currentUser]).emit("UserAdded", result);
            } else {
              //if user saved successful then add user
              //to room with ID
              Room.findById(roomId).then(room => {
                //if the room exists, which it should then save id in room
                if (room) {
                  room.userIds.push(user._id);
                  room.save((err, newRoom) => {
                    if (err) {
                      result = {
                        success: false,
                        data: err,
                        message: "Error adding user to room"
                      };
                      return io
                        .to(people[currentUser])
                        .emit("UserAdded", result);
                    }

                    result = {
                      success: true,
                      data: user,
                      message: "Created User!"
                    };
                    io.to(people[currentUser]).emit("UserAdded", result);
                  });
                }
              });
            }
          });
        });
      });
    }
  });
};

exports.updateUser = async (io, userFromServer, people) => {
  let {
    _id,
    username,
    password,
    roomId,
    role,
    job,
    currentUser
  } = userFromServer;
  let result;

  let errors = [];
  if (!username) {
    errors.push({ message: "User must have a username" });
  }
  if (errors.length > 0) {
    result = { success: false, data: false, message: errors[0].message };
    return io.to(people[currentUser]).emit("UserUpdated", result);
  }

  User.findById(_id)
    .then(user => {
      if (!user) {
        result = { success: false, data: "error", message: "No user" };
        return io.to(people[currentUser]).emit("UserUpdated", result);
      }
      console.log("this is username", user.username);
      (user.username = username),
        (user.password = password),
        (user.roomId = roomId),
        (user.role = role),
        (user.job = job);

      user.save((err, updatedUser) => {
        if (err) {
          result = {
            success: false,
            data: err,
            message: "Error updating user"
          };
          return io.to(people[currentUser]).emit("UserUpdated", result);
        }
        result = { success: true, data: updatedUser, message: "User updated!" };
        return io.to(people[currentUser]).emit("UserUpdated", result);
      });
    })
    .catch(err => {
      console.log(err);
      console.log("this is in user catch");
    });
};

exports.deleteUser = async (io, data, people) => {
  const { currentUser, id } = data;
  let user = await User.findById(id);
  let result;
  user.remove((err, deletedUser) => {
    if (err) {
      result = { success: false, error: err };
      return io.to(people[currentUser]).emit("UserDeleted", result);
    }
    result = { success: true, data: deletedUser };
    io.to(people[currentUser]).emit("UserDeleted", result);
  });
};

exports.changeSettings = async (io, userInfo, people) => {
  //must validate that all info is present
  //this is only allowed per user the the user that is changing the password is the current user
  let {
    id,
    username,
    currentUser,
    current_password,
    new_password,
    new_password_confirmation,
    roomId,
    role,
    job
  } = userInfo;
  console.log(current_password + " current password");

  let errors = [];
  if (!username) {
    errors.push({ message: "User must have a username" });
  }
  if (!current_password) {
    errors.push({ message: "You must enter your password to make changes" });
  }
  if (new_password !== new_password_confirmation) {
    errors.push({
      message: "The new password and new password confirmation do not match"
    });
  }
  if (errors.length > 0) {
    result = { success: false, data: false, message: errors[0].message };
    return io.to(people[currentUser]).emit("updatedSettings", result);
  }

  User.findById(id)
    .then(user => {
      if (!user) {
        //if user does not exist
        result = {
          success: false,
          data: user,
          message: "User does not exists"
        };
        return io.to(people[currentUser]).emit("updatedSettings", result);
      } else {
        //compare the old password with the user password that is current which is user.password
        bcrypt.compare(current_password, user.password).then(isMatch => {
          //if password doesn't match
          if (!isMatch) {
            result = {
              success: false,
              data: isMatch,
              message: "The old password was incorrect"
            };
            return io.to(people[currentUser]).emit("updatedSettings", result);
          }
          //if the password does match then check if the new password exists
          //if the new password does exists then use bcrypt to hash password
          if (!new_password.isEmpty()) {
            bcrypt
              .genSalt(10, function(err, salt) {
                bcrypt.hash(new_password, salt, function(err, hash) {
                  if (err) throw err;
                  //this changes the user password
                  //and also saves the rest of the user info that was changed
                  user.password = hash;
                  (user.username = username),
                    (user.roomId = roomId),
                    (user.role = role),
                    (user.job = job);

                  user
                    .save()
                    .then(response => {
                      //return if successful save
                      result = {
                        success: true,
                        data: response,
                        message: "User data saved with new password!"
                      };
                      return io
                        .to(people[currentUser])
                        .emit("updatedSettings", result);
                    })
                    .catch(err => {
                      //return if error
                      result = {
                        success: false,
                        data: err,
                        message:
                          "Something went wrong while hashing new password"
                      };
                      return io
                        .to(people[currentUser])
                        .emit("updatedSettings", result);
                    });
                });
              })
              .catch(err => {
                result = {
                  success: false,
                  data: err,
                  message: "Something went wrong generating the salt"
                };
                return io
                  .to(people[currentUser])
                  .emit("updatedSettings", result);
              });
          }
          //if the new password was empty then it will just check the old password and if that is correct
          //then it will save the data
          //this is wrong bc current_password is not the hashed version
          (user.username = username),
            (user.password = user.password),
            (user.roomId = roomId),
            (user.role = role),
            (user.job = job);

          user
            .save()
            .then(response => {
              //return if successful save
              result = {
                success: true,
                data: response,
                message: "User data saved!"
              };
              return io.to(people[currentUser]).emit("updatedSettings", result);
            })
            .catch(err => {
              //return if error
              result = {
                success: false,
                data: err,
                message: "Something went wrong while hashing new password"
              };
              return io.to(people[currentUser]).emit("updatedSettings", result);
            });
        });
      }
    })
    .catch(err => {
      result = {
        success: false,
        data: err,
        message: "Something went wrong finding the user"
      };
      return io.to(people[currentUser]).emit("updatedettings", result);
    });
};

//checks if the string is empty or if it is only whitespace
String.prototype.isEmpty = function() {
  return this.length === 0 || !this.trim();
};
