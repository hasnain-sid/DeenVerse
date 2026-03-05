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
    enum:['user','scholar','moderator','admin'],
    default:'user'
  },
  scholarProfile:{
    verifiedAt:{ type:Date, default:undefined },
    verifiedBy:{ type:mongoose.Schema.Types.ObjectId, ref:'User', default:undefined },
    specialties:[{ type:String }],
    credentials:[{
      title:{ type:String },
      institution:{ type:String },
      year:{ type:Number },
      documentUrl:{ type:String }
    }],
    bio:{ type:String, default:'' },
    teachingLanguages:[{ type:String }],
    rating:{
      average:{ type:Number, default:0 },
      count:{ type:Number, default:0 }
    },
    totalStudents:{ type:Number, default:0 },
    totalCourses:{ type:Number, default:0 },
    stripeConnectId:{ type:String, default:undefined },
    payoutSchedule:{ type:String, enum:['weekly','biweekly','monthly'], default:'monthly' },
    applicationStatus:{ type:String, enum:['none','pending','approved','rejected'], default:'none' },
    applicationDate:{ type:Date, default:undefined },
    rejectionReason:{ type:String, default:undefined }
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
  stripeCustomerId:{ type:String, default:undefined, index:true, sparse:true },
  subscription:{
    plan:{ type:String, enum:['student','premium'], default:undefined },
    stripeSubscriptionId:{ type:String, default:undefined },
    currentPeriodEnd:{ type:Date, default:undefined },
    status:{ type:String, default:undefined }, // active, canceled, past_due, etc.
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