import driver from '../Controller/driver_controller';
import auth from '../Module/auth';
import multer from 'multer';
import md5 from 'md5';
import express from 'express'
import path from 'path';

exports.getRouter = (app) => {

	let storage = multer.diskStorage({
	destination : function(req,file,callback){
		console.log(file)
        callback(null,'./src/Uploads/Driver');
	},
	filename : function(req,file,callback){
		let fileUniqueName = md5(Date.now());
        callback(null,fileUniqueName+ path.extname(file.originalname));
    }
});
	let upload = multer({storage:storage});
	
	app.route("/driver/signUp").post(driver.signUp);

	app.route("/driver/verifyOtp").post(driver.verifyOtp);

	app.route("/driver/driverLogin").put(driver.driverLogin);

	app.route("/driver/forgetPassword").put(driver.forgetPassword);

	app.route("/driver/matchOtp").post(driver.matchOtp);

	app.route("/driver/changePassword").put(driver.changePassword);

	return app;
}