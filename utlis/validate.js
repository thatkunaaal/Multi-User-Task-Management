const validator = require('validator');

const validateSignUpData = (req) => {

    // Step-1 Basic check for empty input field.
    if(!req.body.name){
        throw new Error("Please enter your name");
    }
    if(!req.body.email ){
        throw new Error("Please enter Email.");
    }
    if(!req.body.password){
        throw new Error("Please enter password");
    }

    // Step-2 Data Cleaning

    // Considering the name will contain both first name & last name along with space.Hence commenting below code.
    
    // if(!validator.isAlpha(req.body.name))
    //        throw new Error("Name should not contain any Number or special character.");

    if(!validator.isEmail(req.body.email))
        throw new Error("Email should be in a valid format");

    if(!validator.isStrongPassword(req.body.password))
        throw new Error("Kindly enter a strong password which contain a special character, one Uppercase alphabet , a number and whose length should be greater than 6");

};

const validateLoginData = (req) => {
    // empty email & empty password
    if(!req.body.email || !req.body.password || !validator.isEmail(req.body.email) || !validator.isStrongPassword(req.body.password))
        throw new Error("EmailID & password are not valid");

}

module.exports = {validateSignUpData,validateLoginData};