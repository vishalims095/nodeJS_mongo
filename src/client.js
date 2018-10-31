//client.js
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000/', { reconnect: true });


// setInterval(function () {
// 	console.log('1111')
// 	 socket.emit('CH01', "from", "message");
// }, 1000)
let user_id = "aff33c0ea93df910aa4c134e42a97be8";
let latitude = "12121.4545"
let longitude = "4545.45454"
let booking_id = "vavag454545"
let is_driver = 1
setInterval(function () {
	console.log('1111')
	 socket.emit('driverLocation', user_id, latitude, longitude, booking_id, is_driver);
}, 10000)
