import commFunc from '../Module/commonFunction';
import responses from '../Module/responses';
import constant from '../Module/constant';
import config from '../Config/production'
//import UserModel from '../Model/user_model';
import md5 from 'md5';
import typeOf from 'typeof';
import _ from "lodash";
import async from 'async';
import uniqid from 'uniqid'
const {driverModel} =  require('../Model/driver_model');
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');

/*--------------------------------------------
++++++++++++++++ driverSignUp ++++++++++++++++
---------------------------------------------*/

exports.signUp = async (req, res) => {
	try {
		let { full_name, password, email_id, country_code, mobile_number, device_type, device_token, latitude, longitude} = req.body;
	    let location = {type: 'Point', "coordinates" :[req.body.latitude, req.body.longitude]}
	    let driver_id = md5(new Date());
		let created_on = Math.round((new Date()).getTime() / 1000);
		let access_token = uniqid('access-');
	    let verification_code = 1234;
	    let driver1 = await driverModel.findOne({email_id}).exec();
	    if(driver1) {
	    	throw new Error('Email already exist');
	    }
	    let mobileData = await driverModel.findOne({mobile_number}).exec();
	    if(mobileData) {
	    	throw new Error ('Mobile number already exist');
	    }
	    let driverData = req.body;
	    driverData.access_token = access_token;
	    driverData.created_on = created_on;
	    driverData.verification_code = verification_code;
	    driverData.driver_id = driver_id;
	    driverData.location = location;
	    driverData.password = md5(password);
	    let driverDetails = new driverModel(driverData);
	    let driver = await driverDetails.save();
	    if(!driver) {
	    	throw new Error ('Unable to insert driver details');
	    }
	    res.vishalSuccess('Driver signup successfully done', driverData)
	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}

/*-------------------------------------------
+++++++++++++++++ verifyOtp +++++++++++++++++
--------------------------------------------*/
//after signup
exports.verifyOtp = async (req, res) => {
	try {
			let {access_token} = req.headers;
			let {verification_code} = req.body;
			let driverDetails = await driverModel.findOne({access_token}).exec();
			if(!driverDetails) {
				throw new Error ('Invalid access_token');
			}
			if(driverDetails.verification_code != verification_code) {
				res.status(403).vishalError('Invalid verification_code');
			} else {
				let updatedDriver = await driverModel.findOneAndUpdate({access_token}, {$set: {is_verified : 1}}, {new : true});
				res.vishalSuccess(updatedDriver, "verified successfully" );
			}
		}  catch (error) {
			res.status(401).vishalError(error.message);
		}
}


/*---------------------------------------------------------
+++++++++++++++++++ driverLogin +++++++++++++++++++++++++++++
----------------------------------------------------------*/

exports.driverLogin = async (req, res) => {
	try {
		let {email_id, password, latitude, longitude, device_type, device_token} = req.body;
		let access_token = uniqid('access-');
		let location = {type: 'Point',"coordinates" :[req.body.latitude, req.body.longitude]}
		console.log(location);
		let driver = await driverModel.findOne({$and : [{email_id}, {password : md5(password)}]}).exec();
		if(!driver) {
			throw new Error('Invalid credential');
		}
		//console.log(driver);
		if(driver.is_verified === 0) {
			res.vishalSuccess("Please verify OTP", driver)
		} else {
		let updateData = {access_token, latitude, longitude, device_type, device_token, location};
		console.log(updateData)
		let updateddriver = await driverModel.findOneAndUpdate({email_id}, {$set: updateData}, {new : true});
		res.vishalSuccess( updateddriver, "Login successful");
		}
	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}


/*------------------------------------------------
++++++++++++++++++ forgetPassword ++++++++++++++++
-------------------------------------------------*/

exports.forgetPassword = async(req, res) => {
	try {
		let {email_id} = req.body;
		let driver = await driverModel.findOne({email_id}).exec();
		if(!driver) {
			throw new Error('Invalid email_id');
		}
		let updateData = {verification_code : 1111};
		let updateVerificationCode = await driverModel.findOneAndUpdate({email_id}, {$set : updateData}, {new : true});
		res.vishalSuccess({"access_token" : updateVerificationCode.email_id},"otp sent successfully")

	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}

/*---------------------------------------------
++++++++++++++++++ matchOtp +++++++++++++++++++
----------------------------------------------*/
// use for forget password
exports.matchOtp = async(req, res) => {
	try {
		let {email_id, verification_code} = req.body;
		let driver = await driverModel.findOne({email_id}).exec();
		if(!driver) {
			throw new  Error ('Invalid email_id')
		} 
		if(driver.verification_code === verification_code){
			res.vishalSuccess("Otp matched successfully")
		} else {
			throw new Error ('Invalid verification code')	
		}
	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}

/*-------------------------------------------------
+++++++++++++++++ changePassword ++++++++++++++++++
--------------------------------------------------*/
// for forget password
exports.changePassword = async (req, res) => {
	try {
		let {email_id, password} = req.body;
		let driver = await driverModel.findOne({email_id}).exec();
		if(!driver) {
			throw new Error('driver not found');
		} 
		let updateData = {password : md5(password)}
		let updatePassword = await driverModel.findOneAndUpdate({email_id}, {$set : updateData}, {new : true});
		res.vishalSuccess("password changed successfully", updatePassword)
	} catch (error) {
		res.status(403).vishalError(error.message)
	}
}

/*----------------------------------------------
++++++++++++++++ uploadLicense +++++++++++++++++
-----------------------------------------------*/

exports.uploadLicense = async(req, res) => {
	try {
		console.log(req.userData)
	} catch (error) {
		res.status(403).vishalError(error.message)
	}
}