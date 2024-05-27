import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config({
  path:"../config/.env"
})

const databaseConnection = () => {
  mongoose.connect(process.env.MONGO_URI).then((connection) => {
    console.log("Connected to MongoDB")
  }).catch((error) => {
    console.log(error)
  })
}
export default databaseConnection;