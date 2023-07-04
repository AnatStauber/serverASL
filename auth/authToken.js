const jwt = require("jsonwebtoken")
const {config}= require("../config/secret")

exports.authToken = (req, res, next) => {
    let token = req.header("x-api-key");
    if (!token) {
        res.status(401).json({ msg: "you mast send token" })
    }
    try {
        let decodeToken = jwt.verify(token, config.tokenSecret);
       
        req.tokenData=decodeToken;
        // req.body.user_id = decoded.user_id;

        console.log(req.tokenData._id)
        next()
    }
    catch (err) {
        console.log(err)
        res.status(401).json({ msg: "token invalid" })
    }
}
exports.authTokenAdmin = (req,res,next) => {
    let token = req.header("x-api-key");
    if(!token){
      return res.status(401).json({msg:"You need to send token to this endpoint url"})
    }
    try{
      let decodeToken = jwt.verify(token,config.tokenSecret);
      // add to req , so the next function will recognize
      // the tokenData/decodeToken
      console.log(decodeToken.role)
      if(decodeToken.role!="admin"){
        return res.status(401).json({msg:"token invalid, code 3"})
      }
      req.tokenData = decodeToken;
    
      // 12311
      next();
    }
    catch(err){
      console.log(err);
      return res.status(401).json({msg:"Token invalid or expired, log in again or you hacker!"})
    }
  }