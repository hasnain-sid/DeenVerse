import jwt from "jsonwebtoken";
import { AppError } from '../utils/AppError.js'; // Updated path

const isAuthenticated = async (req, res, next) =>{
  try {
    const token = req.cookies.token;

    if(!token){
      return next(new AppError("User not authenticated. Please login.", 401));
    }
    
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded.userId; 
    next(); 
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        return next(new AppError("Invalid token. Please login again.", 401));
    } else if (error instanceof jwt.TokenExpiredError) {
        return next(new AppError("Session expired. Please login again.", 401));
    }
    return next(new AppError("Authentication failed. Please try again later.", 500));
  }
}
export default isAuthenticated;