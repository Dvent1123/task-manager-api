require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 5000 || process.env.PORT;
const HTTP_PORT = 8000 || process.env.HTTP_PORT;
const passport = require("passport");
const usersRouter = require("./routes/users");
const tasksRouter = require("./routes/tasks");
const homeRouter = require("./routes/home");
const tasksController = require("./controllers/tasksController");
const usersController = require("./controllers/usersController");
const roomController = require("./controllers/roomController");
const authRoutes = require("./routes/auth");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  path: "/mysocket",
  cors: {
    origin: `${process.env.CLIENT_URL}`,
    methods: ["GET", "POST"]
  }
});
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV == "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}
app.use(passport.initialize());
require("./config/passport");

io.use(function(socket, next) {
  if (socket.handshake.auth) {
    jwt.verify(socket.handshake.auth.token, process.env.TOKEN_SECRET, function(
      err,
      decoded
    ) {
      if (err) return next(new Error("Authentication error"));
      socket.decoded = decoded;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

let people = {};

//socket.io connection
io.on("connection", socket => {
  console.log("new client connected");
  //subscribes the socket to the room that they are a part of
  socket.on("subscribe", (room, userName) => {
    socket.join(room);
    roomController.joinRoom(io, room, socket.id);
    if (people[userName] == null) {
      people[userName] = socket.id;
    }
    console.log(people);
  });
  socket.on("unsubscribe", (room, userName) => {
    socket.leave(room);
    if (people[userName]) {
      delete people[userName];
    }
    roomController.leaveRoom(io, room);
  });
  //making req to controller to add task
  socket.on("addTask", data => {
    tasksController.newTask(io, data, people);
  });

  socket.on("updateTask", data => {
    tasksController.updateTask(io, data, people);
  });

  socket.on("deleteTask", data => {
    tasksController.deleteTask(io, data, people);
  });

  socket.on("addUser", data => {
    usersController.newUser(io, data, people);
  });

  socket.on("updateUserSettings", data => {
    usersController.changeSettings(io, data, people);
  });

  socket.on("updateUser", data => {
    usersController.updateUser(io, data, people);
  });

  socket.on("deleteUser", id => {
    usersController.deleteUser(io, id, people);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require("mongoose");
const { stringify } = require("querystring");
mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch(err => console.log(err));
const db = mongoose.connection;
db.on("error", error => console.log(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use("/api", usersRouter);
app.use("/api", tasksRouter);
app.use("/api", authRoutes);
app.use("/api", homeRouter);

//this is for the http
app.listen(HTTP_PORT, () => {
  console.log("http is running on 8000");
});

//this is for the sockets
server.listen(PORT, () => {
  console.log("socket server is running 5000");
});
