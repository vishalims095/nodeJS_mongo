import connection from '../Module/connection.js';
import responses from '../Module/responses';
import constant from '../Module/constant';
import comfunc from '../Module/commonFunction.js';

// user schema

var{mongoose, conn} = require("../Module/connection");
let  adminSchema  = mongoose.Schema(
    {
        admin_id : {
            type : String,
            require : true,
            default : null
        }, 
        access_token : {
            type : String,
            require : true,
            default : null
        },
        name : {
            type: String,
            require:true,
            default : null
        },
        email_id : {
            type: String,
            require:true,
            default : null
        },
        mobile_number : {
            require : true,
            type : String,
            default : null
        },
        country_code : {
            require : true,
            type : String,
            default : null
        },
        profile_image:{
            type: String,
            default : null,
            require : true
        },
        password : {
            type : String,
            require : true,
            default : null
        },
        varification_code : {
            type : String,
            default : 0,
            require : true
        }
    },
    {
        strict: true,
        collection: 'Admin',
        versionKey: false
    }
    
);
exports.adminModel = conn.model('Admin', adminSchema);