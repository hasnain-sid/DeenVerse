import  jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
export const Register = async (req,res) => {
  try{
    const {name,username,email,password} = req.body;

    if(!name || !username || !password || !email )
    {
      return res.status(401).json({
        message:"All feilds are required",
        success:false
      })
    }
    const user = await User.findOne({email});
    if(user){
      return res.status(401).json({
        message:"User already registered",
        success:false
      })
    }
    const hashedPassword = await bcryptjs.hash(password,16);
    
    await User.create({
      name,
      username,
      email,
      password:hashedPassword
    });
    return res.status(200).json({
      message:"Account created successfully",
      success:true
    })

  }
  catch(error){
    console.log(error)
  }

}

export const Login = async (req, res) => {
  try {
    const {email, password} = req.body;
    if(!email || !password)
    {
      return res.status(401).json({
        message:"All feilds are requried",
        success:false
      })
    }
    const user = await User.findOne({email});
    if(!user){
      return res.status(401).json({
        message:"User does not exist with this email",
        success:false
      })
    }
    const isMatch = await bcryptjs.compare(password,user.password)
    if(!isMatch)
    {
      return res.status(401).json({
        message:"Incorrect email or password",
        success:false
      })
    }
    const tokenData = {
      userId:user._id
    }
    const token = await jwt.sign(tokenData,process.env.TOKEN_SECRET,{expiresIn:"1d",
    // httpOnly:true,
    // secure:true,
    // sameSite:"None",

    })
    return res.status(201).cookie("token",token,{expiresIn:"1d",httpOnly:true}).json({
      message:`Welcome back ${user.name}`,
      user,
      success:true
    })
  } catch (error) {
    console.log(error)
  }
}

export const Logout = (req, res) => {
  return res.cookie("token","",{expiresIn:new Date(Date.now()),
    // httpOnly:true,
    // secure:true,
    // sameSite:"None",
  }).json({
    message: "User logged out",
    success:true
  })
}

export const saved = async (req, res) => {
  try {
    
    const contentId = req.params.id;

    // const loggedInUser = req.user;
    // console.log(loggedInUser)


    // alternative way IT IS ALSO BETTER WHEN AUTHENTICATION IS REQUIRED


    const loggedInUser = req.body.id;


    // console.log(loggedInUser)
    const user = await User.findById(loggedInUser);
    // console.log(user);
    if(user.saved.includes(contentId)){
      // Unmarked
      await User.findByIdAndUpdate(loggedInUser,{$pull:{saved:contentId}})
      return res.status(201).json({
        message:"Removed",
        success: true
      })
    }
    else{
      // Marked
      await User.findByIdAndUpdate(loggedInUser,{$push:{saved:contentId}})
      return res.status(201).json({
        message:"Saved",
        success: true
      })
    } 
  } catch (error) {
    console.log(error)
  }
}

export const getProfile = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-password")
    return res.status(200).json({
      user,
    })
  } catch (error) {
    console.log(error)
  }
}
export const getOtherUsers = async (req, res) => {
  try {
    const {id} = req.params;
    const otherUsers = await User.find({_id:{$ne:id}}).select("-password")
    if(!otherUsers)
    {
      return res.status(401).json({
        message:"No users found"
      })
    }
    return res.status(200).json({
      otherUsers
    })
  } catch (error) {
    console.log(error)
    
  }
}


export const Follow = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const userId = req.body.id;
    // console.log(loggedInUserId, userId);
    const loggedInUser  = await User.findById(loggedInUserId);
    const user = await User.findById(userId);
    if(!user.followers.includes(loggedInUserId)){
      await user.updateOne({$push:{followers:loggedInUserId}})
      await loggedInUser.updateOne({$push:{followings:userId}})
    }
    else{
      return res.status(400).json({
        message: `User already followed to ${user.name}`
      })
    }
    return res.status(200).json({
      message: `${loggedInUser.name} just followed to ${user.name}`,
      success: true
    })
  } catch (error) {
    console.log(error);
    
  }
}

export const Unfollow = async (req, res) => {
  try {
    const loggedInUserId = req.user;
    const userId = req.body.id;
    const loggedInUser  = await User.findById(loggedInUserId);
    const user = await User.findById(userId);
    // console.log(loggedInUserId, userId);

    if(user.followers.includes(loggedInUserId)){
      await user.updateOne({$pull:{followers:loggedInUserId}})
      await loggedInUser.updateOne({$pull:{followings:userId}})
    }
    else{
      return res.status(400).json({
        message: `User already unfollowed to ${user.name}`
      })
    }
    return res.status(200).json({
      message: `${loggedInUser.name} just unfollowed to ${user.name}`,
      success: true
    })
  } catch (error) {
    console.log(error);
    
  }
}




