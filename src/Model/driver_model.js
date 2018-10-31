import connection from '../Module/connection.js';
import responses from '../Module/responses';
import constant from '../Module/constant';
import comfunc from '../Module/commonFunction.js';

// export default {

//  }

var{mongoose, conn} = require("../Module/connection");
let  driverSchema  = mongoose.Schema(
    {
        driver_id : {
            type : String,
            require : true
        }, 
        access_token : {
            type : String,
            require : true
        },
        full_name : {
            type: String,
            require:true,
        },
        email_id : {
            type: String,
            require:true,
        },
        country_code : {
            type : String,
             default : null
        },
        mobile_number : {
            type : String,
             default : null
        },
        profile_image:{
            type: String,
            default : null

        },
        password : {
            type : String,
            require : true,
             default : null
        },
        device_type : {
            type : Number,
            require : true,
             default : 0
        },
        device_token : {
            type : String,
            require : true,
             default : null
        },
        latitude : {
            type : Number,
            require : true,
            default : 0.00
        }, 
        longitude : {
            type : Number,
            require : true,
            default : 0.00
        },

         location : {
             type: {type: String, default: 'Point'},
            coordinates: [Number]
        },
        // location : {
        //      type: { type: String },
        //     coordinates: [Number],
        // },
        //example
    //"location" : {"coordinates" : [7888.44, 4545.44]}
        is_blocked : {
            type : Number,
            default : 0
        },
        is_active : {
            type : Number,
            default : 0
        },
        is_verified : {
            type : Number,
            default : 0
        },
        is_profile_created : {
            type : Number,
            default : 0
        },
        verification_code : {
            type : Number,
            default : 0
        },
        created_on : {
            type : String,
            require : true
        },
        about_me : {
            type : String,
            //require : true
        },
        social_id : {
            type : String,
            default : null
        },
        social_type : {
            type : Number,
            default : 0
        },
        is_social_active : {
            type : Number,
            default : 0
        },
        is_booked : {
            type : Number,
            default : 0
        }
    },
    {
        strict: true,
        collection: 'Driver',
        versionKey: false
    }
    
);

driverSchema.index({location: '2dsphere'})

exports.driverSchema = driverSchema;
exports.driverModel = conn.model('Driver', driverSchema);