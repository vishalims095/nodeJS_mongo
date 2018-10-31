import commFunc from '../Module/commonFunction';
import responses from '../Module/responses';
import constant from '../Module/constant';
import md5 from 'md5';
import _ from "lodash";
import async from 'async';
import uniqid from 'uniqid'
const {adminModel} =  require('../Model/admin_model');
const {UserModel} =  require('../Model/user_model');
const {driverModel} =  require('../Model/driver_model');
/*---------------------------------------------
++++++++++++++++ adminSignUp +++++++++++++++++++
----------------------------------------------*/

exports.adminSignUp = async(req, res) => {
	try {
		let admin_id = uniqid('admin-');
		let access_token = uniqid('access-');
		let varification_code = "1234";
		let {name, email_id, password, country_code, mobile_number, profile_image} = req.body;
		password = md5(password)
		let adminData = {name, email_id, password, country_code, mobile_number, profile_image, varification_code, access_token, admin_id};
		let adminDetails = new adminModel(adminData);
		adminDetails.save()
		.then((data) => {
			if(!data) {
				throw new Error('Unable to insert adminData')
			} res.vishalSuccess(data, "Admin details added successfully")
		})
	} catch(error) {
		res.status(403).vishalError(error.message);
	}
}

/*-----------------------------------------------
+++++++++++++++++++ adminLogin ++++++++++++++++++
------------------------------------------------*/

exports.admin_login = async(req, res) => {
	try {
		console.log("Upal admin login calling");
		let {email_id, password} = req.body;
		let adminData = await adminModel.findOne({$and : [{email_id}, {password : md5(password)}]}).exec(); 
		if(!adminData) {
			throw new Error('Invalid credential')
		}
		let access_token = uniqid('access-');
		let updateData = await adminModel.findOneAndUpdate({email_id}, {$set : {access_token}}, {new : true}).select('-password');
		if(!updateData) {
			throw new Error('Unable to update access_token')
		} res.vishalSuccess(updateData, "login successful")
	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}

/*-------------------------------------------------------------
+++++++++++++++++++++ admin_forget_password +++++++++++++++++++
--------------------------------------------------------------*/

exports.admin_forget_password = async(req, res) => {
	try{
		console.log("upal admin forget password calling")
		let {email_id} = req.body;
		let varification_code = 1111;
		let admin = await adminModel.findOne({email_id}).exec();
		if(!admin) {
			throw new Error('Invalid email_id');
		}
		let access_token = uniqid('access-');
		let updateData = {access_token, varification_code};
		let updateVerificationCode = await adminModel.findOneAndUpdate({email_id}, {$set : updateData}, {new : true});
		if(!updateVerificationCode) {
			throw new Error('Unable to process')
		} res.vishalSuccess(updateVerificationCode, "OTP sent successfully")
	} catch(error) {
		res.status(403).vishalError(error.message);
	}
}

/*------------------------------------------------------------
+++++++++++++++++++++++++ verifyOtp ++++++++++++++++++++++++++
-------------------------------------------------------------*/

exports.verifyOtp = async(req, res) => {
	try {
		console.log("upal admin verifyOtp calling")
		let {access_token} = req.headers;
		let {varification_code} = req.body;
		console.log(req.adminData);
		if(req.adminData.varification_code != varification_code) {
			throw new Error('Invalid varification_code')
		} res.vishalSuccess("verified successfully", "verified successfully")
	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}

/*-----------------------------------------------------------
+++++++++++++++++++++++ changePassword ++++++++++++++++++++++
------------------------------------------------------------*/

exports.changePassword = async(req, res) => {
	try {
		console.log("upal admin change password calling")
		let {password} = req.body;
		let access_token = req.adminData.access_token;
		console.log(access_token);
		let updateData = md5(password)
		console.log(updateData)
		let adminData1 = await adminModel.findOneAndUpdate({access_token}, {$set : {password : updateData}}, {new : true}).select('-password');
		if(!adminData1) {
			throw new Error('Unable to update password')
		} res.vishalSuccess(adminData1, "password changed successfully")
	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}
/*-------------------------------------------------------------
+++++++++++++++++++++ updateProfileImage ++++++++++++++++++++++
-------------------------------------------------------------*/

exports.updateProfileImage = async (req, res) => {
	try {
		let {mobile_number, name} = req.body;
		let access_token = req.adminData.access_token;
		if(req.files.length > 0) {
			console.log("image comming")
			let profile_image = `/Admin/${req.files[0].filename}`
			let updateData = {mobile_number, name, profile_image};
			let data = await adminModel.findOneAndUpdate({access_token}, {$set : updateData}, {new : true}).select('-password');
			if(!data) {
				throw new Error('Unable to process edit profile')
			} res.vishalSuccess(data, 'profile edit successfully done')
		} else {
			console.log("without image comming")
			let updateData = {mobile_number, name};
			let data = await adminModel.findOneAndUpdate({access_token}, {$set : updateData}, {new : true}).select('-password');
			if(!data) {
				throw new Error('Unable to process edit profile')
			} res.vishalSuccess(data, 'profile edit successfully done')
		}
	} catch (error) {
		res.status(403).vishalError(error.message);
	}
}

/*------------------------------------------------
+++++++++++++++++ get_user_details++++++++++++++++
------------------------------------------------*/

exports.get_user_details = async(req, res) => {
	console.log("get userdetails calling");
	try {
		let userData = await UserModel.find({}).select('-password')
		if(!userData) {
			throw new Error('Unable to get user details')
		} res.vishalSuccess(userData, "user details")
	} catch(error) {
		res.status(403).vishalError(error.message);
	}
}

/*---------------------------------------------------
++++++++++++++++++ adminblockUser +++++++++++++++++++
---------------------------------------------------*/

exports.blockUser = async(req, res) => {
	console.log("block unblock calling")
	try {
		let {id, is_block} = req.body;
		console.log("is_blocked =============", is_block)
		console.log("user_id ====================",id);
		let updateData = { is_blocked : is_block}
		let data = await UserModel.findOneAndUpdate({user_id : id}, {$set : updateData}, {new : true}).select('-password');
		if(!data) {
			throw new Error('Unable to block user')
		} res.vishalSuccess(data, 'User block successfully')
	} catch(error) {
		res.status(403).vishalError(error.message);
	}
}


/*------------------------------------------------
+++++++++++++++++ get_driver_details++++++++++++++++
------------------------------------------------*/

exports.get_driver_details = async(req, res) => {
	console.log("get driver details calling");
	try {
		let driverData = await driverModel.find({}).select('-password')
		if(!driverData) {
			throw new Error('Unable to get driver details')
		} res.vishalSuccess(driverData, "driver details")
	} catch(error) {
		res.status(403).vishalError(error.message);
	}
}

/*---------------------------------------------------
++++++++++++++++++ adminblockDriver +++++++++++++++++++
---------------------------------------------------*/

exports.blockDriver = async(req, res) => {
	console.log("Driver block unblock calling")
	try {
		let {id, is_block} = req.body;
		console.log("is_blocked =============", is_block)
		console.log("user_id ====================",id);
		let updateData = { is_blocked : is_block}
		let data = await driverModel.findOneAndUpdate({driver_id : id}, {$set : updateData}, {new : true}).select('-password');
		if(!data) {
			throw new Error('Unable to block user')
		} res.vishalSuccess(data, 'Driver block successfully')
	} catch(error) {
		res.status(403).vishalError(error.message);
	}
}

