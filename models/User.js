const mongoose=require('mongoose')
const {isEmail}=require('validator')
const bcrypt=require('bcrypt') 

const userSchema=new mongoose.Schema({
  email:{
    type:String,
    required:[true,'Please enter an email'],
    unique:true,
    lowercase:true,
    validate: [isEmail,'Please enter a valid email']
  },
  password:{
    type:String,
    required:[true,'Please enter the password'],
    minlength:[6,'Minimum password length of 6 character is required'],
  },
})

// this mongo hooks fired after the the user is saved to db
userSchema.post('save',function(doc,next){
  console.log('New user was created & saved', doc)
  next();
})

// this mongo hook is fired before the user is saved to db
userSchema.pre('save',async function(next){
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt); 
  next()
})

//static method login user
userSchema.statics.login=async function(email,password){
  const user=await this.findOne({email});
  if(user){
    const auth =await bcrypt.compare(password,user.password)
    if(auth){
      return user
    }
    throw Error("Incorrect password")
  }
  throw Error('Incorrect email')
}

const User=mongoose.model('user',userSchema);

module.exports=User; 