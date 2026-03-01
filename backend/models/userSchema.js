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
  role:{
    type:String,
    enum:['user','admin','moderator'],
    default:'user'
  },
  banned:{
    type:Boolean,
    default:false
  },
  bannedAt:{
    type:Date,
    default:undefined
  },
  mutedUntil:{
    type:Date,
    default:undefined
  },
  verified:{
    type:Boolean,
    default:false
  },
  streakGoal:{
    type:Number,
    default:7,
    min:1,
    max:365
  },
},{timestamps:true});

// ── Indexes (Phase 6 — Database Optimization) ────────
// Note: email and username already have unique: true in the schema definition,
// which auto-creates unique indexes. Only the text search index is defined here.
userSchema.index(
  { name: 'text', username: 'text' },
  { weights: { username: 2, name: 1 }, name: 'user_text_search' }
);

export const User = mongoose.model("User",userSchema);