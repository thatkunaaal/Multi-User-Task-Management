const jwt = require("jsonwebtoken");
const { User } = require("../model/user");
const JWT_SECRET_KEY = "TaskManager@231"

const userAuth = async (req,res,next) => {
    try {
        // Step-1) Validate the token.

        const token = req.cookies?.token; 
        console.log(token);
        if(!token){
            throw new Error("Please login!");
        }

        //Find the user
        const decodedObj =  jwt.verify(token,JWT_SECRET_KEY);

        const {id} = decodedObj;

        const user = await User.findByPk(id);

        if(!user)
            throw new Error("User not found");

        req.user = user;

        next();

    } catch (err) {
        res.status(401).json({message : err.message})
    }
}


module.exports = {userAuth};