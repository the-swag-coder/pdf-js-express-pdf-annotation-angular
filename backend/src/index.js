let express = require('express');
let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);

const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.roomId);
        socket.broadcast.to(data.roomId).emit('joined');
    });

    socket.on('update', (data) => {
        io.in(data.roomId).emit('update pdf', {...data});
    });
});

server.listen(port, () => {
    console.log(`started on port: ${port}`);
});
