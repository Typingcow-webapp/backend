require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const cors = require("cors");

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
});
mongoose.set("useCreateIndex", true);
mongoose.connection.on("error", (error) => console.log(error));
mongoose.Promise = global.Promise;

require("./auth/auth");

const routes = require("./routes/routes");
const secureRoute = require("./routes/secure-routes");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io").listen(http);
// const io = require("socket.io")(http, {
//   cors: {
//     origin: "https://example.com",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Access-Control-Allow-Origin"],
//     credentials: true,
//   },
// });

let players = {};
let results = {};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api/", routes);
app.use(
  "/api/user",
  passport.authenticate("jwt", { session: false }),
  secureRoute
);

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({ error: err });
});

app.get("/", (req, res) => {
  res.send("Yo");
});

const clientRooms = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("newGame", handleNewGame);
  socket.on("joinGame", handleJoinGame);
  socket.on("endGame", handleEndGame);

  const result = {};

  function handleEndGame(gameCode, wpm, number) {
    result[`player${number}`] = wpm;

    if (!results[gameCode]) {
      results[gameCode] = [];
    }

    results[gameCode].push(result);

    socket.emit("playerScores", results[gameCode]);
    socket.broadcast.emit("playerScores", results[gameCode]);
  }

  function handleNewGame(username) {
    let roomName = makeId(5);

    socket.emit("displayPlayer1", username);
    // players.push(username);

    clientRooms[socket.id] = roomName;

    players[roomName] = [username];

    socket.emit("gameCode", roomName);

    socket.join(roomName);
    socket.number = 1;
    socket.emit("init", 1);
  }

  function handleJoinGame(gameCode, username) {
    const room = io.sockets.adapter.rooms[gameCode];

    players[gameCode].push(username);

    socket.emit("displayPlayer2", players, gameCode);
    socket.broadcast.emit("displayPlayer2Globally", username);

    console.log(players);

    let allUsers;

    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;

    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      socket.emit("unknownGame");

      return;
    } else if (numClients > 1) {
      socket.emit("tooManyPlayers");
      return;
    }

    clientRooms[socket.id] = gameCode;

    socket.join(gameCode);
    socket.number = 2;
    socket.emit("init", 2);

    socket.emit("startGame");
    socket.broadcast.emit("startGame");
  }

  function makeId(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+=-";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
});

http.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
