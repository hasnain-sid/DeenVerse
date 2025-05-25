import express from "express";
import dotenv from "dotenv";
import databaseConnection from "./config/database.js";
import cookieParser from "cookie-parser";
import  userRoute from "./routes/userRoute.js";
 import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config({
  path:".env"
})
databaseConnection();
const app = express();

// middleware
app.use(express.urlencoded({
  extended:true
}));
app.use(express.json());
app.use(cookieParser());

// Determine CORS origin based on environment
const allowedOrigins = ['http://localhost:3000']; // Default for dev
const productionFrontendURL = process.env.FRONTEND_URL_PROD || 'https://deen-verse-front.vercel.app'; // Fallback if not set

if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(productionFrontendURL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}
 
app.use(cors(corsOptions));
// apis
app.use("/api/v1/user",userRoute);

// Centralized Error Handler
// This should be defined AFTER all other app.use() and routes calls
app.use(errorHandler);

app.listen(process.env.PORT,()=>{
  console.log(`Server is listning at port ${process.env.PORT}`);
})