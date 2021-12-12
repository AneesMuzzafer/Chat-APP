/**
 * Chat-APP
 *
 * @author      Anees Muzzafer
 * @copyright   Anees Muzzafer
 *
 *
 */


const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");

const { generateMessage, generateLocationMessage } = require("./utils/utils");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));


io.on("connection", (socket) => {
    console.log("New Connection established");

    socket.on("join", ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit("message", generateMessage(user.room, "Welcome!!!"));
        socket.broadcast.to(user.room).emit("message", generateMessage(user.room, `${user.username} has joined the chat!`));


        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback();
    });



    socket.on("newMessage", (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Message is Profane");
        }

        const user = getUser(socket.id);
        if (user) {
            io.to(user.room).emit("message", generateMessage(user.username, message));
        }

        callback();
    })

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit("message", generateMessage(user.room, `${user.username} has left the chat.`));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }



    });

    socket.on("sendLocation", (position, callback) => {
        const user = getUser(socket.id);
        if (user) {
            io.emit("locationMessage", generateLocationMessage(user.username, position));
        }
        callback();
    });
});


server.listen(PORT, () => {
    console.log(`Server with so started on Port ${PORT}`);
});








