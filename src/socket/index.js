
'use strict';
const connections = [];

// When the user disconnects.. perform this
function onDisconnect(socket, message) {
    connections.splice(connections.indexOf(socket), 1);
    console.info('Disconnected: %s , sockets connected', message, connections.length);
}

// When the user connects.. perform this
function onConnect(socket) {
    console.info('Connected: %s sockets connected', connections.length);
    // Insert sockets below
    require('./driver').register(socket);



}

module.exports = (io) => {
    io.sockets.on('connection', (socket) => {
        console.log(socket.handshake.headers.host)
        socket.address = socket.handshake.headers.host !== null ? socket.handshake.headers.host : 'http://localhost:3000/';
        socket.connectedAt = new Date();
        connections.push(socket);

        // Call onDisconnect.
        socket.on('disconnect', (message) => {
            console.log("disconnected socket");
            onDisconnect(socket, message);
        });

        // Call onConnect.
        onConnect(socket);
    });
};