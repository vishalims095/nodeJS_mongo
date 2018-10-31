import responses from '../Module/responses';
import constant from '../Module/constant';
import comfunc from '../Module/commonFunction.js';
var{mongoose, conn} = require("../Module/connection");
let  userSchema  = mongoose.Schema(
    {
        user_id : {
            type : String,
            require : true
        }, 
        access_token : {
            type : String,
            require : true
        },   
        first_name : {
            type : String,
            require : true,
            default : null  
        },
        last_name : {
            type : String,
            require : true,
            default : null
        },
        gender : {
            type : String,
            require : true,
            default : null
        },
        email_id : {
            type: String,
            //default : null
            require:true,
            // unique:true,
            // lowercase:true
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
        is_blocked : {
            type : Number,
            //require : true,
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
            type : String,
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
        }
    },
    {
        strict: true,
        collection: 'User',
        versionKey: false
    }
    
);

userSchema.index({location: '2dsphere'})

// aboutUs schema

let aboutUsSchema = mongoose.Schema({
    content : {
        type : String,
        default : null
    }
},
    {
        strict: true,
        collection: 'aboutUs',
        versionKey: false
    }
)

// terms and conditions

let termsAndConditionSchema = mongoose.Schema({
    content : {
        type : String,
        default : null
    }
},
    {
        strict: true,
        collection: 'termsAndCondition',
        versionKey: false
    }
)

// support Schema

let supportSchema = mongoose.Schema({
    support_id : {
        type : String,
        require : true,
        default : null
    },
    user_id : {
        type : String,
        require : true,
        default : null
    },
    email_id : {
        type : String,
        require : true,
        default : null
    },
    subject : {
        type : String,
        require : true,
        default : null
    },
    message : {
        type : String,
        require : true,
        default : null
    },
    time : {
        type : String,
        require : true,
        default : null
    }
},
    {
        strict: true,
        collection: 'Support',
        versionKey: false
    }
)

// FAQ schema

let FAQSchema = mongoose.Schema({
    question_id : {
        type : String,
        require : true,
        default : null
    },
    question : {
        type : String,
        require : true,
        default : null
    },
    answer : {
        type : String,
        require : true,
        default : null
    }
}, 
    {
        strict : true,
        collection : 'FAQ',
        versionKey : false
    }
)

//pickUp location schema

let locationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        require: true,
        default : null
    },
    location_id: {
        type: String,
        require: true,
        default: null

    },
    address: {
        type: String,
        require: true,
        default: null

    },
    latitude: {
        type: Number,
        require: true,
        default: 0.00
    },
    longitude: {
        type: Number,
        require: true,
        default: 0.00,

    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    make_favourite: {
        type: Number,
        require: true,
        default: 0
    },
    title : {
        type : String,
        require : true,
        default : null
    },
    added_on: {
        type: String,
        require: true,
        default: null
    }
}, {
    strict: true,
    collection: 'LocationDetails',
    versionKey: false
})
locationSchema.index({ location: '2dsphere' })


//pickUp location schema

let pickupLocationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        require: true
    },
    pickup_location_id: {
        type: String,
        require: true,
        default: null

    },
    address: {
        type: String,
        require: true,
        default: null

    },
    latitude: {
        type: Number,
        require: true,
        default: 0.00
    },
    longitude: {
        type: Number,
        require: true,
        default: 0.00,

    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    make_favourite: {
        type: Number,
        require: true,
        default: 0
    },
    added_on: {
        type: String,
        require: true,
        default: null
    }
}, {
    strict: true,
    collection: 'pickupLocation',
    versionKey: false
})
pickupLocationSchema.index({ location: '2dsphere' })

//dropLocation schema

let dropLocationSchema = mongoose.Schema({
   user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        require: true
    },
    pickUp: {
        type: mongoose.Schema.ObjectId,
        ref: "pickupLocation",
        require: true
    },
    drop_location_id: {
        type: String,
        require: true,
        default: null
    },
    address: {
        type: String,
        require: true,
        default: null

    },
    latitude: {
        type: Number,
        require: true,
        default: 0.00
    },
    longitude: {
        type: Number,
        require: true,
        default: 0.00,

    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    make_favourite: {
        type: Number,
        require: true,
        default: 0
    },
    added_on: {
        type: String,
        require: true,
        default: null
    }
}, {
    strict: true,
    collection: 'dropLocation',
    versionKey: false
})
dropLocationSchema.index({ location: '2dsphere' })

pickupLocationSchema.virtual("lattitude2").get(function() {
    return this.location.coordinates[0];
})
pickupLocationSchema.virtual("longitude2").get(function() {
    return this.location.coordinates[1];
})
pickupLocationSchema.set('toJSON', { virtuals: true })


exports.termsAndConditionModel = conn.model('termsAndCondition', termsAndConditionSchema)
exports.FAQModel = conn.model('FAQ', FAQSchema);
exports.supportModel = conn.model('Support', supportSchema);
exports.aboutUsModel = conn.model('aboutUs', aboutUsSchema);
exports.UserModel = conn.model('User', userSchema); 
exports.dropLocationModel = conn.model('dropLocation', dropLocationSchema);
exports.pickupLocationModel = conn.model('pickupLocation', pickupLocationSchema);
exports.locationModel = conn.model('LocationDetails', locationSchema)