import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({
  path:"../config/.env"
})

 const isAuthenticated = async (req, res, next) =>{
  try {
    const token= req.cookies.token;
    console.log(token);

    if(!token){
      return await res.status(401).json({message:"User not authenticated",
    success:false});
    }
    const decode = jwt.verify(token, process.env.TOKEN_SECRET);
    console.log(decode);
    req.user = decode.userId;
    // console.log(req.user)
    next();
    
  } catch (error) {
    console.error(error)
  }
}
export default isAuthenticated;