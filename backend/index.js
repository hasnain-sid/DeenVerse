import express from "express";
import dotenv from "dotenv";
import databaseConnection from "./config/database.js";
import cookieParser from "cookie-parser";
import  userRoute from "./routes/userRoute.js";
 import cors from "cors";

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
const corsOptions = {
 origin: 'https://deen-verse-front.vercel.app',
  //  origin: 'http://localhost:3000',

  credentials: true
}
 
app.use(cors(corsOptions));
// apis
app.use("/api/v1/user",userRoute);
 
 
 
app.listen(process.env.PORT,()=>{
  console.log(`Server is listning at port ${process.env.PORT}`);
})