import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true,
    unique:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  saved:[{
    type:String
  }],
  bio:{
    type:String,
    default:''
  },
  avatar:{
    type:String,
    default:''
  },
  followers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  following:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  passwordResetToken:{
    type:String,
    default:undefined
  },
  passwordResetExpires:{
    type:Date,
    default:undefined
  },
},{timestamps:true});

// ── Indexes (Phase 6 — Database Optimization) ────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index(
  { name: 'text', username: 'text' },
  { weights: { username: 2, name: 1 }, name: 'user_text_search' }
);

export const User = mongoose.model("User",userSchema);