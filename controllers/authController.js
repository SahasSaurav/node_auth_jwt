const User = require("../models/User");
const jwt=require('jsonwebtoken');

//handle error
const handleError = (err) => {
  let errors = { email: "", password: "" };

  //if user try to create an account with already existing email id
  if (err.code === 11000) {
    errors.email = "That email is already registered by another user";
    return errors;
  }

  //incorrect email for login 
  if(err.message==='Incorrect email'){
    errors.email="That email is not registered"
  }

  //incorrect password for login 
  if(err.message==='Incorrect password'){
    errors.password="That password is incorrect "
  }

  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const maxAge=1*24*60*60;

//creating JWT token for auth
const createToken=(id)=>{
  return jwt.sign({id},process.env.TOKEN_SECRET,{
    expiresIn:maxAge,
  })
}

const signup_get = (req, res) => {
  res.render("signup");
};

const login_get = (req, res) => {
  res.render("login");
};

const signup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token=createToken(user._id)
    res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
    res.status(201).json({user:user._id});
  } catch (err) {
    const errors = handleError(err);
    res.status(400).json({errors});
  }
};

const login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user=await User.login(email,password)
    const token=createToken(user._id)
    res.cookie('jwt',token,{httpOnly:true,maxAge:maxAge*1000})
    res.status(200).json({user:user._id})
  } catch (err) {
    const errors=handleError(err)
    res.status(400).json({errors}) 
  }
};

const logout_get=async(req,res)=>{
  res.cookie('jwt','',{httpOnly:true, maxAge:1})
  res.redirect('/')
}

module.exports = {
  signup_get,
  login_get,
  signup_post,
  login_post,
  logout_get
};
