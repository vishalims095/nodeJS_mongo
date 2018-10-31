import constants from './constant';
import async from 'async';
import _ from 'lodash';
import UserModal from '../Model/user_model';
import constant from '../Module/constant';
import config from '../Config/development';
var twilio = require ('twilio');
var firebase = require("firebase-admin");
 var FCM = require('fcm-node');
/*
 * -----------------------
 * GENERATE RANDOM STRING
 * -----------------------
 */
 exports.generateRandomString = () => {
	let text = "";
	let possible = "123456789";

	for (var i = 0; i < 4; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
};

/*
 * -----------------------------------------------
 * CHECK EACH ELEMENT OF ARRAY FOR BLANK AND Key
 * -----------------------------------------------
 */

//TODO- > there is no need of promises
var emailRegex="^([a-zA-Z0-9_.]+@[a-zA-Z0-9]+[.][.a-zA-Z]+)$";
exports.checkKeyExist = (req, arr) => {
	return new Promise((resolve, reject) => {
		var array = [];
		_.map(arr, (item) => {
			if(req.hasOwnProperty(item)) {
				var value = req[item];
				if( value == '' || value == undefined ) { 
					array.push(item+" can not be empty");
				}
                if(item == "email_id" && !value.match(emailRegex)){
                array.push(constant.responseMessages.Email_NOT_VALID)
                }
                if(item == "password" && value.length<8){
                 array.push( constant.responseMessages.PASSWORD_MUST_8_CHARACTER)   
                }
                // if(item == "mobile_number" && typeof(value)!= "number"){
                //  array.push(item+ "  should be number")   
                // }
				resolve(array);
			} else {
				array.push(item+" key is missing");
				resolve(array);
			}
		});
	}); 
};


/*
------------------------------------------------
      				Send OTP
------------------------------------------------      
*/

exports.sendotp = function(varification_code){
// var accountSid = ''; // Your Account SID from www.twilio.com/console
//     var authToken = '';   // Your Auth Token from www.twilio.com/console

    var twilio = require('twilio');
    var client = new twilio(config.accountSid, config.authToken);
    console.log(varification_code);
       client.messages.create({
                body: "your one time password(OTP) is  "  +varification_code+  "  valid for 3 minutes do not disclose it" ,
                to: '+919555011355',  // Text this number
                from: '(561) 316-2532' // From a valid Twilio number
            })
       .then((message) => console.log(message.sid)); 
            
}


/*
-------------------------------------------------
		send mail
-------------------------------------------------
*/

exports.sendmail = function(help_text , email_id) {
	 var nodemailer = require("nodemailer");
	     var smtpTransport = require("nodemailer-smtp-transport");
        var config = {
            "SMTP_HOST": "smtp.sendgrid.net",
            "SMTP_PORT": 25,
            "SMTP_USER":"apikey", //default
            "SMTP_PASS": "key"
            //"SMTP_PASS" : config.SMTP_PASS
        }
             var mailer = nodemailer.createTransport(smtpTransport({
                        host: config.SMTP_HOST,
                        port: config.SMTP_PORT,
                        auth: {
                            user: config.SMTP_USER,
                            pass: config.SMTP_PASS
                        }
                    }));
                    mailer.sendMail({
                        from: "techfluper@gmail.com",
                        to: email_id,
                        cc : "vishalims095@gmail.com",
                        subject : "SnapPay verification code",
                        template: "text",
                        html: " Your verification code is :" + help_text
                    }, (error, response) => {
                        if (error) {
                            console.log(error);
                            // resolve({ message: "Email not send " });
                        } else {
                            console.log(response);
                            // resolve({ message: "Email send successfully" });
                        }
                        mailer.close();
                        //res.send("Response send successfully");
                    });
}


/*----------------------------------------
            pushNotification
---------------------------------------*/

var FCM = require('fcm-push');
var fcm = new FCM('key');
exports.sendNotification = function(devic_token) {
    var message = {  
        to : devic_token,
        collapse_key : 'insert-collapse-key',
        data : {
            "first_name" : "vishal sharma"
            // <random-data-key1> : '<random-data-value1>',
            // <random-data-key2> : '<random-data-value2>'
        },
        notification : {
            title : 'Title of the notification',
            body : 'Body of the notification'
        }
    };
    fcm.send(message, function(err,response){  
        if(err) {
            console.log(err);
            console.log("Something has gone wrong !");
        } else {
            console.log("Successfully sent with resposne :",response);
        }
    });
}

 exports.unixTimeConversion = function convertTimestamp(timestamp) {
  var d = new Date(timestamp * 1000),   // Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),  // Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),         // Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),     // Add leading 0.
        ampm = 'AM',
        time;
            
    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh == 0) {
        h = 12;
    }
    
    // ie: 2013-02-18, 8:35 AM  
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
        
    return mm;
}


exports.verifyData = (data = {}) => {
    var result = {};
    var count = 0;
    _.map(data, (val, key) => {
        if (val && val.length || _.isInteger(val)) {
            result[key] = val;
        }
    })
    return result;
}

//QR code generator
var qr = require('qr-image');
exports.generateQRcode = function(id) {
  var code = qr.image(id, { type: 'svg' });
  res.type('svg');
  code.pipe(res);
}

/* ====================== Android push notification ======================================*/

 exports.sendPushNotification = function (serverKey, token, device_type, payload, notify) {
    console.log({payload});
         //console.log(serverKey, token, device_type, payload, notify);
            var fcm = new FCM(serverKey);
            var message = {
                to: token,
                collapse_key: 'your_collapse_key',
                //notification: notify,
                data: payload,
             };
             console.log(message)
            fcm.send(message, function(err, response) {
                if (err) {
                    console.log(null, err);
                } else {
                    console.log(null, response)
                }
            }); 
        
    }

/*==================================== Ios push notification ===============================*/

 exports.sendPushNotificationForIos = function (serverKey, token, device_type, payload, notify) {
    //console.log({payload});
         //console.log(serverKey, token, device_type, payload, notify);
            var fcm = new FCM(serverKey);
            var message = {
                to: token,
                collapse_key: 'your_collapse_key',
                notification: notify,
                data: payload,
             };
             console.log(message)
            fcm.send(message, function(err, response) {
                if (err) {
                    console.log(null, err);
                } else {
                    console.log(null, response)
                }
            }); 
        
    }

/*========================================== Interval function ===================================*/

    //  exports.intervalFunc = (user_id) => {
    //     console.log(user_id)
    //     console.log("interval calling");
    //     let sql = "update driver_tbl set is_booked = 0 where user_id = ? ";
    //     connection.query(sql, [user_id], (err, result) => {
    //         if(err) {
    //             console.log("unable to set driver status");
    //         } else {
    //             console.log("driver status set successfully");
    //         }
    //     })
    // }

  // how to use setTimeout(commFunc.intervalFunc, 60000, user_id);