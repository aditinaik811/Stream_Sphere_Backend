const jwt = require('jsonwebtoken')
require('dotenv').config()
module.exports = async (req,res,next)=>{
    try{
           const token = req.headers.authorization.split(" ")[1];
           await jwt.verify(token,process.env.JWT_TOKEN)
           console.log("Token verified")
           next()
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            msg:"Invalid Token "
        })
    }
    
}