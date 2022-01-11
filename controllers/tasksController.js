const mongoose = require("mongoose");
const Tasks = require("../models/Tasks");
const passport = require("passport");

exports.getTasks = async (req, res) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    if (err) {
      console.log(err);
    }
    if (info != undefined) {
      res.send(info.message);
    } else {
      let tasksArray = [];
      try {
        tasksArray = await Tasks.find({ roomId: user.roomId });
        return res.status(201).send({
          error: false,
          tasksArray
        });
      } catch {
        res.status(500).send({
          error: true
        });
      }
    }
  })(req, res);
};

exports.newTask = async (io, taskFromServer, people) => {
  const { createdBy, roomId, assignedTo, status, desc } = taskFromServer;
  let result;

  let errors = [];
  if (!desc) {
    errors.push({ message: "You must add a description" });
  }
  if (!status) {
    errors.push({ message: "Each task must have a status" });
  }
  if (errors.length > 0) {
    result = { success: false, data: false, message: errors[0].message };
    return io.to(people[createdBy]).emit("TaskAdded", result);
  }

  const newTask = new Tasks({
    createdBy: createdBy,
    roomId: roomId,
    assignedTo: assignedTo,
    status: status,
    desc: desc
  });

  newTask.save((err, task) => {
    if (err) {
      result = {
        success: false,
        data: err,
        message: "There was an error saving the task"
      };
      return io.to(people[createdBy]).emit("TaskAddedd", result);
    }

    result = { success: true, data: task, message: "The task was added!" };
    io.in(roomId).emit("TaskAdded", result);
  });
};

exports.updateTask = async (io, taskFromServer, people) => {
  const {
    id,
    createdBy,
    roomId,
    assignedTo,
    status,
    desc,
    userName
  } = taskFromServer;

  let result;

  let errors = [];
  if (!desc) {
    errors.push({ message: "You must add a description" });
  }
  if (!status || status == 0) {
    errors.push({ message: "Each task must have a status" });
  }
  if (errors.length > 0) {
    result = { success: false, data: false, message: errors[0].message };
    return io.to(people[userName]).emit("TaskUpdated", result);
  }

  let task = await Tasks.findById(id);
  (task.createdBy = createdBy),
    (task.roomId = roomId),
    (task.assignedTo = assignedTo),
    (task.status = status),
    (task.desc = desc);

  task.save((err, updatedTask) => {
    if (err) {
      result = {
        success: false,
        data: err,
        message: "There was an error saving the task."
      };
      return io.to(people[userName]).emit("TaskUpdated", result);
    }

    result = { success: true, data: updatedTask, message: "Task updated!" };
    io.in(task.roomId).emit("TaskUpdated", result);
  });
};

exports.deleteTask = async (io, data, people) => {
  const { id, userName } = data;
  let task = await Tasks.findById(id).then(test => {
    return test;
  });
  let result;

  task.remove((err, deletedTask) => {
    if (err) {
      result = {
        success: false,
        data: err,
        message: "There was an error deleting the task."
      };
      return io.to(people[userName]).emit("TaskDeleted", result);
    }

    result = { success: true, data: deletedTask };
    io.in(task.roomId).emit("TaskDeleted", result);
  });
};
