const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {
    Server
} = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    // console.log('a user connected');
    // socket.broadcast.emit digunakan untuk membroadcast ke client yg telah connect kecuali diri sendiri
    // sedangkan io.emit akan membroadcast ke semua orang termasuk diri sendiri
    socket.broadcast.emit('newMessage', {
        sender: 'System',
        message: 'Someone joined the chat',
        timestamp: Date(),
    })

    // Ketika ada message baru
    // Emit / umumkan ke semuanya
    socket.on('newMessage', (message) => {
        io.emit('newMessage', message);
        console.log(`Chat baru: ${message}`);
    })

    // Ketika user terdisconnect
    socket.on('disconnect', () => {
        // console.log('user disconnected');
        socket.broadcast.emit('newMessage', {
            sender: 'System',
            message: 'Someone left the chat',
            timestamp: Date(),
        })
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});