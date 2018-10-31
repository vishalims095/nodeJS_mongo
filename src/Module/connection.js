
//connection pooling

// var mysql = require('mysql')
// var connection = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "upal",
//   port : "3306"
// })
// connection.getConnection((err, connection) => {
//     if (err) {
//         if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//             console.error('Database connection was closed.')
//         }
//         if (err.code === 'ER_CON_COUNT_ERROR') {
//             console.error('Database has too many connections.')
//         }
//         if (err.code === 'ECONNREFUSED') {
//             console.error('Database connection was refused.')
//         }
//     }
//     if (connection) connection.release()
//     return
// })
// module.exports = connection


const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb://127.0.0.1:27017/upal");;
exports.mongoose = mongoose;
exports.conn = conn;