const express = require('express')
const path = require('path')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app);
const io = socketIo(server)

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];

io.on('connection', (socket) => {
    console.log('conectado')

    socket.on('join-request', (username) => {
        socket.username = username
        connectedUsers.push(username)
        console.log(connectedUsers);

        socket.emit('user-ok', connectedUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u != socket.username)
        console.log('nova list ' + connectedUsers)

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        };

        //socket.emit('showmsg', obj)
        socket.broadcast.emit('showmsg', obj)
    });


})