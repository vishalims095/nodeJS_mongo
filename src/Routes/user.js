
import user from '../Controller/user_controller';
import auth from '../Module/auth';
import multer from 'multer';
import md5 from 'md5';
import express from 'express'
import path from 'path';

exports.getRouter = (app) => {

    let storage = multer.diskStorage({
        destination: function(req, file, callback) {
            console.log(file)
            callback(null, './src/Uploads/User');
        },
        filename: function(req, file, callback) {
            let fileUniqueName = md5(Date.now());
            callback(null, fileUniqueName + path.extname(file.originalname));
        }
    });
    let upload = multer({ storage: storage });

    app.route("/user/signup").post(user.signup);

    app.route("/user/login").post(user.login);

    app.route("/user/verifyOtp").post(user.verifyOtp);

    app.route("/user/varifyAccount").post(user.varifyAccount);

    app.route("/user/forgetPassword").post(user.forgetPassword);

    app.route("/user/changePassword").put(user.changePassword);

    app.route("/user/socialSignUp").post(user.socialSignUp);

    app.route("/user/isSocialActivated").post(user.isSocialActivated);

    app.route("/user/aboutUs").get(user.aboutUs);

    app.route("/user/support").post(auth.requiresLogin, user.support);

    app.route("/user/addFAQ").post(user.addFAQ);

    app.route("/user/getFAQ").get(user.getFAQ);

    app.route("/user/termsAndCondition").get(user.termsAndCondition);

    app.route("/user/logout").post(auth.requiresLogin, user.logout);

    app.route("/user/changeEmailId").post(auth.requiresLogin, user.changeEmailId);

    app.route("/user/editProfile").post(auth.requiresLogin, upload.any(), user.editProfile);

    app.route("/user/changeMobileNumber").post(auth.requiresLogin, user.changeMobileNumber);

/*=========================================================================
                            Location 
==========================================================================*/
    app.route("/user/addPickupLocation").post(auth.requiresLogin, user.addPickupLocation);

    app.route("/user/addDropLocation").post(auth.requiresLogin, user.addDropLocation);

    app.route("/user/getFavouritePickup").get(auth.requiresLogin, user.getFavouritePickup);

    app.route("/user/getFavouriteDrop").get(auth.requiresLogin, user.getFavouriteDrop);

    app.route("/user/addLocation").post(auth.requiresLogin, user.addLocation);
    
    app.route("/user/getLocationList").get(auth.requiresLogin, user.getLocationList);

    return app;
}