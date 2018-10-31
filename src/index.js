import http from "http";
import chalk from "chalk";
import express from 'express';
import bodyParser from 'body-parser';
import environment from './Config/environment';
import config from './Config/development.json';
import path from 'path';
import glob from 'glob';
import cors from 'cors';

const app = express();
app.server = http.createServer(app);
const io = require('socket.io').listen(app.server);
require("./socket")(io);
const port = process.env.PORT || 3000;
process.env.NODE_ENV = environment.configuration;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../src/Uploads')));
app.use("/admins", express.static(path.join(__dirname, 'adminPanel')));
app.get('/admins/*', (req, res) => {
//     res.sendFile(`${__dirname}/adminPanel/index.html`);
res.sendfile(path.resolve('../src/adminPanel/index.html'));
})

app.use(cors());

require('./helpers/bindHelpers')();

const responseHandler = require('./middlewares/responseHandler');

// (req, res, next) => { next() }
app.use('/', responseHandler);
let initRoutes = () => {
	// including all routes
	glob("./Routes/*.js", {cwd: path.resolve("./src")}, (err, routes) => {
		if (err) {
			console.log("Error occured including routes");
			return;
		}
		routes.forEach((routePath) => {
			require(routePath).getRouter(app); // eslint-disable-line
		});
		console.log("included " + routes.length + " route files");
	});
}


initRoutes();

app.listen(port, () => {
	console.log("Server is running on port "+port);
});


// import http from "http";
// import express from "express";
// import cors from "cors";
// import path from "path";
// import glob from "glob";
// import chalk from "chalk";
// import bodyParser from "body-parser";

// const app = express();
// app.server = http.createServer(app);
// //code for listen server through socket.io
// const io = require('socket.io').listen(app.server);
// // Socket
// require("./socket")(io);

// app.use(cors());

// // 3rd party middleware
// app.use(bodyParser.urlencoded({
//     extended: true
// }));
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, '../src/Uploads')));
// let initRoutes = () => {
// 	// including all routes
// 	glob("./Routes/*.js", {cwd: path.resolve("./src")}, (err, routes) => {
// 		if (err) {
// 			console.log("Error occured including routes");
// 			return;
// 		}
// 		routes.forEach((routePath) => {
// 			require(routePath).getRouter(app); // eslint-disable-line
// 		});
// 		//cron.reminder();
// 		console.log("included " + routes.length + " route files");
// 	});
// }
// initRoutes(app);
// const port = process.env.PORT || 3000;

// app.server.listen(port);
// console.log("Started on port " + port);