
const { UserModel, AdminModel } =  require('../Model/user_model');

import connection from '../module/connection.js';
exports.register = (socket) => {
   socket.on('driverLocation', function(driver_id, latitude, longitude, booking_id, is_driver) {
      if(is_driver == 1) {
         console.log(is_driver);
	   	console.log(driver_id);
	   	console.log(latitude);
	   	console.log(longitude);
         console.log(booking_id);
      console.log("hello vishal calling")
      let sql = "update driver_tbl set latitude = ?, longitude = ? where user_id = ?";
      connection.query(sql, [latitude, longitude, driver_id], (err, result) => {
      	if(err) {
      		console.log(err);
      	} else {
            socket.emit("getDriverLocation",driver_id, latitude, longitude, booking_id )
      		console.log("Driver's lat long updated successfully");
      	}
      })
      } else {
         console.log("normal user calling");
         socket.emit("getDriverLocation",driver_id, latitude, longitude, booking_id )
      }
   });
}