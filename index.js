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

let users = [];

io.on('connection', (socket) => {
    // console.log('a user connected');

    // Handle User Login
    socket.on('newUser', (user) => {
        if (!users.includes(user)) {
            // Jika nama belum terdaftar
            socket.emit('newUserResponse', {
                status: true,
                user
            });
            users.push({
                id: socket.id, //digenerate otomatis oleh socket
                user,
            });
            userJoinNotif(user);
        } else {
            // Jika nama sudah terdaftar
            socket.emit('newUserResponse', {
                status: false,
                user
            });
        }
    })

    // socket.broadcast.emit digunakan untuk membroadcast ke client yg telah connect kecuali diri sendiri
    // sedangkan io.emit akan membroadcast ke semua orang termasuk diri sendiri
    function userJoinNotif(name) {
        socket.broadcast.emit('newMessage', {
            sender: 'System',
            message: `${name} joined the chat`,
            timestamp: Date(),
        })
        updateOnlineUsersList();
    }

    // Ketika user left
    function userLeftNotif(name) {
        socket.broadcast.emit('newMessage', {
            sender: 'System',
            message: `${name} left the chat`,
            timestamp: Date(),
        })
    }

    // Ketika ada message baru
    // Emit / umumkan ke semuanya
    socket.on('newMessage', (message) => {
        io.emit('newMessage', message);
        console.log(`Chat baru: ${message}`);
    })

    // Ketika user terdisconnect
    socket.on('disconnect', () => {
        // console.log('user disconnected');
        // Hapus user yang terdisconnect
        users = users.filter((user) => {
            if (user.id == socket.id) {
                userLeftNotif(user.user);
            }
            return user.id != socket.id;
        });
        updateOnlineUsersList()
    });

    // Mengirim data online user
    function updateOnlineUsersList() {
        io.emit('addOnlineUsers', users);
    }

    // Listen is typing
    socket.on('isTyping', (isTyping) => {
        const user = users.find((user) => user.id == socket.id);
        io.emit('renderIsTyping', {
            isTyping,
            message: `${user.user} sedang mengetik..`,
        });
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});