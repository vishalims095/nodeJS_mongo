import connection from './connection';
import responses from './responses';
const { UserModel } =  require('../Model/user_model');
const { adminModel } =  require('../Model/admin_model');
exports.requiresLogin = async (req, res, next) => {
    console.log("auth calling")
    let {access_token} = req.headers;
    if(access_token) {
        let user = await UserModel.findOne({access_token})
        if(!user) {
            responses.authenticationErrorResponse(res);
            return;
        }
        console.log(user)
        req.userData = user;
        next();
    } else {
        responses.parameterMissingResponse(res);
    }
}

exports.adminLogin = async (req, res, next) => {
    console.log("auth calling")
    let {access_token} = req.headers;
    if(access_token) {
        let user = await adminModel.findOne({access_token})
        if(!user) {
            responses.authenticationErrorResponse(res);
            return;
        }
        req.adminData = user;
        next();
    } else {
        responses.parameterMissingResponse(res);
        return;
    }
}