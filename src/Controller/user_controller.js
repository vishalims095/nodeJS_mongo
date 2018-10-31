import commFunc from '../Module/commonFunction';
import responses from '../Module/responses';
import constant from '../Module/constant';
import config from '../Config/production'
//import UserModel from '../Model/user_model';
import md5 from 'md5';
import typeOf from 'typeof';
import _ from "lodash";
import async from 'async';
import uniqid from 'uniqid';
const { UserModel, AdminModel, aboutUsModel, supportModel, FAQModel, termsAndConditionModel, pickupLocationModel, dropLocationModel, locationModel } = require('../Model/user_model');
var jwt = require('jsonwebtoken');
var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
const Joi = require('joi');
/*------------------------------------------
+++++++++++++++ signUp ++++++++++++++++++++
-------------------------------------------*/


exports.signup = (req, res) => {
    let { first_name, last_name, email_id, country_code, mobile_number, password, device_type, device_token, about_me, latitude, longitude, gender } = req.body;
    let user_id = md5(new Date());
    let location = { type: 'Point', "coordinates": [req.body.latitude, req.body.longitude] }
    let created_on = Math.round((new Date()).getTime() / 1000);
    let access_token = uniqid('access-');
    let verification_code = "1234";
    let manKeys = ["first_name", "last_name", "email_id", "country_code", "mobile_number", "password", "device_type", "device_token", "latitude", "longitude", "gender"];
    commFunc.checkKeyExist(req.body, manKeys)
        .then(function(result) {
            if (result.length > 0) {
                responses.parameterMissing(res, result[0]);
            } else {
                // console.log(location.coordinates[0])
                console.log("everything is fine")
                UserModel.find({ $or: [{ email_id }, { mobile_number }] })
                    .then((userResult) => {
                        if (userResult == 0) {
                            let userData = { user_id, created_on, access_token, verification_code, first_name, last_name, email_id, country_code, mobile_number, password: md5(password), device_type, device_token, about_me, latitude, longitude, location, gender }
                            console.log(userData);
                            let userDetails = new UserModel(userData)
                            userDetails.save().then((data) => {
                                    if (data == 0) {
                                        responses.invalidCredential(res, "Unable to add user details")
                                    } else {
                                        //let html = '<p>Click <a href="'+config.base_url +'user/varifyAccount/'+user_id+'" >here</a> to varify your details</p>'
                                        //console.log(html);
                                        //commFunc.sendmail()
                                        let mobile = country_code.concat(mobile_number);
                                        //commFunc.sendotp(verification_code, mobile);
                                        delete userData.password;
                                        responses.success(res, userData, "OTP sent to your mobile number.");
                                    }
                                })
                                .catch(error => responses.sendError(error.message, res));
                        } else {
                            responses.invalidCredential(res, "User already exist.")
                        }
                    })
                    .catch(error => responses.sendError(error.message, res));
            }
        })
        .catch(error => responses.sendError(error.message, res));
}

/*---------------------------------------------------------
+++++++++++++++++++ userLogin +++++++++++++++++++++++++++++
----------------------------------------------------------*/

exports.login = async (req, res) => {
    try {
        let { mobile_number, password, latitude, longitude, device_type, device_token } = req.body;
        let access_token = uniqid('access-');
        let location = { type: 'Point', "coordinates": [req.body.latitude, req.body.longitude] }
        let user = await UserModel.findOne({ $and: [{ mobile_number }, { password: md5(password) }] }, {}, { lean: true }).exec();
        if (!user) {
            throw new Error(' Invalid Credentials.');
        }
        let verification_code = "1234";
        //console.log(user);
        if (user.is_verified === 0) {
            let { country_code, mobile_number } = UserModel;
            commFunc.sendotp(verification_code, country_code + mobile_number);
            res.vishalSuccess(user, "Please verify OTP.")
        } else {
            let updateData = { access_token, latitude, longitude, device_type, device_token, location };
            console.log(updateData)
            let updatedUser = await UserModel.findOneAndUpdate({ mobile_number }, { $set: updateData }, { new: true });
            res.vishalSuccess(updatedUser, "Login successful.");
        }
    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}

/*-----------------------------------------------------
+++++++++++++++++++++++ varifyAccount +++++++++++++++++
------------------------------------------------------*/

exports.varifyAccount = async (req, res) => {
    try {
        let { access_token } = req.headers;
        let { verification_code } = req.body;
        let userDetails = await UserModel.findOne({ access_token }).exec();
        if (!userDetails) {
            throw new Error('Invalid access_token');
        }
        if (userDetails.verification_code != verification_code) {
            res.status(403).vishalError('Invalid verification code.');
        } else {
            let updateUser = await UserModel.findOneAndUpdate({ access_token }, { $set: { is_verified: 1 } }, { new: true });
            res.vishalSuccess(updateUser, "Account verified successfully.");
        }
    } catch (error) {
        res.status(401).vishalError(error.message);
    }
}



/*------------------------------------------------
++++++++++++++++++ forgetPassword ++++++++++++++++
-------------------------------------------------*/

exports.forgetPassword = async (req, res) => {
    try {
        let { mobile_number } = req.body;
        let user = await UserModel.findOne({ mobile_number }, {}, { lean: true }).exec();
        if (!user) {
            throw new Error('This mobile number is not registered.');
        }
        let updateData = { verification_code: "1234" };
        let OTP = "1234";
        let { country_code } = user;
        let updateVerificationCode = await UserModel.findOneAndUpdate({ mobile_number }, { $set: updateData }, { new: true });
        commFunc.sendotp(OTP, country_code + mobile_number);
        res.vishalSuccess(updateData, "OTP sent successfully")

    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}

/*-------------------------------------------------
+++++++++++++++++ changePassword ++++++++++++++++++
--------------------------------------------------*/

exports.changePassword = async (req, res) => {
    try {
        let { mobile_number, password } = req.body;
        let user = await UserModel.findOne({ mobile_number }).exec();
        if (!user) {
            throw new Error('Invalid email id.');
        }
        let updateData = { password: md5(password) }
        let updatePassword = await UserModel.findOneAndUpdate({ mobile_number }, { $set: updateData }, { new: true });
        res.vishalSuccess(updatePassword, "Password changed successfully.")
    } catch (error) {
        res.status(403).vishalError(error.message)
    }
}

/*--------------------------------------------
+++++++++++++++ verifyOtp ++++++++++++++++++++
---------------------------------------------*/

exports.verifyOtp = async (req, res) => {
    try {
        let { mobile_number, verification_code } = req.body;
        let user = await UserModel.findOne({ mobile_number }, {}, { lean: true }).exec();
        if (!user) {
            throw new Error('Invalid mobile number');
        } else {
            // console.log(user);
            // let {country_code,mobile_number} =user; 
            if (user.verification_code === verification_code) {
                res.vishalSuccess(user, "OTP match");
            } else {
                res.status(403).vishalError('Invalid OTP')
            }
        }
    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}

/*---------------------------------------------------------
 +++++++++++++++++++++++ socialSignUp ++++++++++++++++++++++
----------------------------------------------------------*/

exports.socialSignUp = async (req, res) => {
    try {
        let { first_name, last_name, email_id, country_code, mobile_number, social_id, device_type, device_token, latitude, longitude, gender } = req.body;
        let condition = { social_id };
        let location = { type: 'Point', "coordinates": [req.body.latitude, req.body.longitude] }
        let user_id = md5(new Date());
        let created_on = Math.round((new Date()).getTime() / 1000);
        let access_token = uniqid('access-');
        let verification_code = "1234";

        let user = await UserModel.findOne(condition).exec();
        if (user) {
            res.vishalSuccess(user, "SocialId already exist")
        }
        let emailData = await UserModel.findOne({ email_id }).exec();
        if (emailData) {
            throw new Error('email already exist')
        }

        let mobileData = await UserModel.findOne({ mobile_number }).exec();
        if (mobileData) {
            throw new Error('Mobile already exist')
        }
        // let insertData = { user_id, access_token, first_name, password : md5(password), email_id, country_code, mobile_number, social_id, social_type, device_type, device_token, latitude, longitude, created_on, is_social_active : 1, verification_code : 1234};
        let insertData = req.body;
        insertData.access_token = access_token;
        insertData.user_id = user_id;
        insertData.created_on = created_on;
        insertData.verification_code = verification_code;
        insertData.location = location;
        insertData.social_type = 1;

        let userDetails = new UserModel(insertData)
        let user1 = await userDetails.save();
        if (!user1) {
            throw new Error('Unable to add social details')
        }
        delete insertData.password;
        res.vishalSuccess(insertData, 'social signup successfully done')

    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}


/*--------------------------------------
+++++++++ isSocialActivated ++++++++++++
---------------------------------------*/

exports.isSocialActivated = async (req, res) => {
    //console.log(req.userData);
    try {
        //console.log(req.userData);
        let { social_id } = req.body;
        let is_social_active = 0
        let user = await UserModel.findOne({ social_id }).exec();
        if (!user) {
            res.vishalSuccess({ is_social_active }, "SocialId not exist")
        } else {
            //console.log(user);
            is_social_active = user.is_social_active
            res.vishalSuccess(user, "SocialId exist");
        }

    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}


/*--------------------------------------------------------
++++++++++++++++++++++++++ getAboutUs ++++++++++++++++++++
---------------------------------------------------------*/
exports.aboutUs = async (req, res) => {
    try {
        let data = await aboutUsModel.findOne()
        if (!data) {
            throw new Error('No data found')
        }
        res.vishalSuccess(data.content, "About us content")
    } catch (error) {
        res.status(403).vishalError('no data found')
    }
}

/*------------------------------------------------
+++++++++++++++++++ support ++++++++++++++++++++++
-------------------------------------------------*/

exports.support = async (req, res) => {
    try {
        let user_id = req.userData.user_id;
        let time = Math.round((new Date()).getTime() / 1000);
        let support_id = uniqid('support-');
        let { email_id, subject, message } = req.body;
        const schema = Joi.object().keys({
            email_id: Joi.string().required().error(e => 'email_id require'),
            subject: Joi.string().required().error(e => 'subject require'),
            message: Joi.string().required().error(e => 'message require')
        })
        const result = Joi.validate(req.body, schema, { abortEarly: true });
        if (result.error) {
            if (result.error.details && result.error.details[0].message) {
                responses.parameterMissing(res, result.error.details[0].message);
            } else {
                responses.parameterMissing(res, result.error.message);
            }
            return;
        }
        let supportContent = req.body;
        supportContent.user_id = user_id;
        supportContent.support_id = support_id;
        supportContent.time = time;
        let supportData = new supportModel(supportContent)
        let data = await supportData.save();
        if (!data) {
            throw new Error('Unable to process your query')
        }
        res.vishalSuccess({ support_id }, 'Your query successfully sent')
    } catch (error) {
        res.status(403).vishalError(error.message)
    }
}

/*---------------------------------------------
++++++++++++++++ addFAQ +++++++++++++++++++++++
----------------------------------------------*/

exports.addFAQ = async (req, res) => {
    try {
        let question_id = uniqid('ques-');
        let { question, answer } = req.body;
        let data = req.body;
        data.question_id = question_id;
        let FAQContent = new FAQModel(data);
        let FAQData = await FAQContent.save();
        if (!FAQData) {
            throw new Error('Unable to add FAQ')
        }
        res.vishalSuccess({ question_id }, 'FAQ inserted successfully')
    } catch (error) {
        res.status(403).vishalError(error.message)
    }
}

/*-------------------------------------------
+++++++++++++++++ getFAQ ++++++++++++++++++++
--------------------------------------------*/

exports.getFAQ = async (req, res) => {
    try {
        let FAQ = await FAQModel.find().exec();
        if (!FAQ) {
            throw new Error('Unable to get FAQ details')
        }
        res.vishalSuccess(FAQ, 'FAQ data')
    } catch (error) {
        req.status(403).vishalError(error.message);
    }
}

/*--------------------------------------------------------
++++++++++++++++++ getTermsAndCondition ++++++++++++++++++
---------------------------------------------------------*/
exports.termsAndCondition = async (req, res) => {
    try {
        let data = await termsAndConditionModel.findOne()
        if (!data) {
            throw new Error('No data found')
        }
        res.vishalSuccess(data.content, "About us content")
    } catch (error) {
        res.status(403).vishalError('no data found')
    }
}

/*----------------------------------
++++++++++++ logout ++++++++++++++++
-----------------------------------*/
exports.logout = async (req, res) => {
    try {
        let access_token = req.userData.access_token;
        let updateData = await UserModel.findOneAndUpdate({ access_token }, { $set: { access_token: "", device_token: "", device_type: "" } }, { new: true });
        if (!updateData) {
            throw new Error('Unable to logout')
        }
        res.vishalSuccess(updateData, "Logout successfully")
    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}


/*--------------------------------------------------
+++++++++++++++++++ changeEmailId +++++++++++++++++
---------------------------------------------------*/

exports.changeEmailId = async (req, res) => {
    try {
        let { email_id } = req.body;
        let access_token = req.userData.access_token;
        let emailData = await UserModel.findOne({ email_id }).exec();
        if (emailData) {
            throw new Error('Email Id already exist')
        }
        let updateData = { email_id };
        let userData = await UserModel.findOneAndUpdate({ access_token }, { $set: updateData }, { new: true }).select('-password')
        if (!userData) {
            throw new Error('Unable to change email id')
        }
        res.vishalSuccess(userData, 'Email changed successfully');
    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}


/*-------------------------------------------------
++++++++++++++++++ editProfile ++++++++++++++++++++
--------------------------------------------------*/

exports.editProfile = async (req, res) => {
    try {
        let { first_name, last_name, country_code, mobile_number, profile_image } = req.body;
        const schema = Joi.object().keys({
            first_name: Joi.string().required().error(e => 'first_name require'),
            last_name: Joi.string().required().error(e => 'last_name require'),
            country_code: Joi.string().required().error(e => 'country_code require'),
            mobile_number: Joi.string().required().error(e => 'mobile_number require')
        })
        const result = Joi.validate(req.body, schema, { abortEarly: true });
        if (result.error) {
            if (result.error.details && result.error.details[0].message) {
                responses.parameterMissing(res, result.error.details[0].message);
            } else {
                responses.parameterMissing(res, result.error.message);
            }
            return;
        }
        let access_token = req.userData.access_token;
        let actual_mobile_number = req.userData.mobile_number;
        if (req.files.length > 0) {
            console.log("image comming");
            let profile_image = `/User/${req.files[0].filename}`
            let mobileData = await UserModel.findOne({ mobile_number }).exec();
            if (mobileData && mobile_number != actual_mobile_number) {
                throw new Error('Mobile Number already registered.')
            }
            let editProfileData = { first_name, last_name, country_code, mobile_number, profile_image, is_profile_created: 1 }
            let updateData = await UserModel.findOneAndUpdate({ access_token }, { $set: editProfileData }, { new: true }).select('-password')
            if (!updateData) {
                throw new Error('Unable to process edit profile.')
            }
            res.vishalSuccess(updateData, 'Profile edit successfully done.')
        } else {
            console.log("no image comming");
            let mobileData = await UserModel.findOne({ mobile_number }).exec();
            if (mobileData && mobile_number != actual_mobile_number) {
                throw new Error('Mobile Number already registered.')
            }
            let editProfileData = { first_name, last_name, country_code, mobile_number, is_profile_created: 1 }
            let updateData = await UserModel.findOneAndUpdate({ access_token }, { $set: editProfileData }, { new: true }).select('-password')
            if (!updateData) {
                throw new Error('Unable to process edit profile.')
            }
            res.vishalSuccess(updateData, 'Profile edit successfully done.')
        }

    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}

/*----------------------------------------------------
+++++++++++++++++ changeMobileNumber +++++++++++++++++
-----------------------------------------------------*/

exports.changeMobileNumber = async (req, res) => {
    try {
        let { country_code, mobile_number } = req.body;
        let access_token = req.userData.access_token;
        console.log(req.body)
        let emailData = await UserModel.findOne({ country_code, mobile_number }).exec();
        if (emailData) {
            throw new Error('Mobile already exist')
        }
        let mobile = country_code.concat(mobile_number);

        let updateData = { country_code, mobile_number };
        let userData = await UserModel.findOneAndUpdate({ access_token }, { $set: updateData }, { new: true }).select('-password')
        if (!userData) {
            throw new Error('Unable to change mobile number')
        }

        commFunc.twillio("1234", mobile);
        res.vishalSuccess(userData, 'Mobile changed successfully');
    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}

/*--------------------------------------------------------
++++++++++++++++++++ addPickupLocation +++++++++++++++++++
---------------------------------------------------------*/

exports.addPickupLocation = async(req, res) => {
    try {
        let {address, latitude, longitude, make_favourite} = req.body;
        let user = req.userData._id;
        let pickup_location_id = uniqid('pickUp-');
        let location = { type: 'Point', "coordinates": [req.body.latitude, req.body.longitude] }
        let added_on = Math.round((new Date()).getTime() / 1000);
        const schema = Joi.object().keys({
            address : Joi.string().required().error(e => 'address require'),
            latitude : Joi.number().required().error(e => 'latitude require'),
            longitude : Joi.string().required().error(e => 'longitude require'),    
            make_favourite : Joi.number().allow('').optional().error(e => 'make_favourite require')
        })  
        const result = Joi.validate(req.body, schema, { abortEarly: true });
        if (result.error) {
            if (result.error.details && result.error.details[0].message) {
                responses.parameterMissing(res, result.error.details[0].message);
            } else {
                responses.parameterMissing(res, result.error.message);
            }
            return;
        }
        let pickupData = {user, pickup_location_id, address, latitude, longitude, location, added_on, make_favourite}
        let pickupModel = new pickupLocationModel(pickupData);
        let pickupDetails = await pickupModel.save();
        if(!pickupDetails) {
            throw new Error('Unable to add pickupDetails')
        } res.vishalSuccess(pickupDetails, 'Pickup details added successfully')

    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}


/*--------------------------------------------------------
++++++++++++++++++++ addDropLocation +++++++++++++++++++
---------------------------------------------------------*/

exports.addDropLocation = async(req, res) => {
    try {
        let {address, latitude, longitude, make_favourite, pickup_id } = req.body;
        let user = req.userData._id;
        let drop_location_id = uniqid('pickUp-');
        let location = { type: 'Point', "coordinates": [req.body.latitude, req.body.longitude] }
        let added_on = Math.round((new Date()).getTime() / 1000);
        const schema = Joi.object().keys({
            address : Joi.string().required().error(e => 'address require'),
            latitude : Joi.number().required().error(e => 'latitude require'),
            longitude : Joi.string().required().error(e => 'longitude require'),
            pickup_id : Joi.string().required().error(e => 'pickup_id _id is required'),    
            make_favourite : Joi.number().allow('').optional().error(e => 'make_favourite require')
        })  
        const result = Joi.validate(req.body, schema, { abortEarly: true });
        if (result.error) {
            if (result.error.details && result.error.details[0].message) {
                responses.parameterMissing(res, result.error.details[0].message);
            } else {
                responses.parameterMissing(res, result.error.message);
            }
            return;
        }
        let dropData = {user, pickUp : pickup_id, drop_location_id, address, latitude, longitude, location, added_on, make_favourite}
        let dropModel = new dropLocationModel(dropData);
        let dropDetails = await dropModel.save();
        if(!dropDetails) {
            throw new Error('Unable to add dropLocationDetails')
        } res.vishalSuccess(dropDetails, 'Drop location details added successfully')

    } catch (error) {
        res.status(403).vishalError(error.message);
    }
}

/*------------------------------------------------------
+++++++++++++++++ getFavouritePickup +++++++++++++++++++
-------------------------------------------------------*/

exports.getFavouritePickup = async (req, res) => {
    try {
        let user = req.userData._id;
        let pickUpData = await pickupLocationModel.find({$and : [{user}, {make_favourite : 1}]})
        if(!pickUpData) {
            throw new Error('No favourite pickup found.')
        } res.vishalSuccess(pickUpData, "Pick up details")
    } catch (error) {
        res.status(403).vishalError(error.message)
    }
}


/*------------------------------------------------------
+++++++++++++++++ getFavouritePickup +++++++++++++++++++
-------------------------------------------------------*/

exports.getFavouriteDrop = async (req, res) => {
    try {
        let user = req.userData._id;
        let dropData = await dropLocationModel.find({$and : [{user}, {make_favourite : 1}]})
        if(!dropData) {
            throw new Error('No favourite drop location found')
        } res.vishalSuccess(dropData, "Drop location details")
    } catch (error) {
        res.status(403).vishalError(error.message)
    }
}

/*-------------------------------------------------
++++++++++++++++++++ addLocation ++++++++++++++++++++++
--------------------------------------------------*/

exports.addLocation = async (req, res) => {
    try {
        let {address, latitude, longitude, make_favourite, title } = req.body;
        let user = req.userData._id;
        let location_id = uniqid('location-');
        let location = { type: 'Point', "coordinates": [req.body.latitude, req.body.longitude]}
        let added_on = Math.round((new Date()).getTime() / 1000);
        const schema = Joi.object().keys({
            address : Joi.string().required().error(e => 'address require'),
            latitude : Joi.number().required().error(e => 'latitude require'),
            longitude : Joi.number().required().error(e => 'longitude require'),
            title : Joi.string().required().error(e => 'title _id is required'),    
            make_favourite : Joi.number().allow('').optional().error(e => 'make_favourite require')
        })  
        const result = Joi.validate(req.body, schema, { abortEarly: true });
        if (result.error) {
            if (result.error.details && result.error.details[0].message) {
                responses.parameterMissing(res, result.error.details[0].message);
            } else {
                responses.parameterMissing(res, result.error.message);
            }
            return;
        }
        let locationData = {location_id, user, address, location, latitude, longitude, make_favourite, title, added_on };
        let location1 = new locationModel(locationData);
        let locationDetails = await location1.save()
        if(!locationDetails) {
        	throw new Error('Unable to add location.')
        } res.vishalSuccess(locationDetails, "Location added successfully.")
    } catch (error) {
        res.status(403).vishalError(error.message)
    }
}

/*------------------------------------------------------
+++++++++++++++++ getLocationList +++++++++++++++++++
-------------------------------------------------------*/

exports.getLocationList = async (req, res) => {
    try {
        let user = req.userData._id;
        let locationData = await locationModel.find({user})
        if(!locationData) {
            throw new Error('No  location found')
        } res.vishalSuccess(locationData, "Location details")
    } catch (error) {
        res.status(403).vishalError(error.message)
    }
}
