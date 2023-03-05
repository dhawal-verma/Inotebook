const express = require('express')
const User = require('../models/Users')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchuser')
const JWT_SECRET = 'weknowthat!';

//Route 1
router.post('/signup',[
    body('name','Enter a valid name').isLength({ min: 5 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Enter a valid password').isLength({ min: 5 }),
],
async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try{
        //To find the email already exist or not...
    let user = await User.findOne({email:req.body.email});
    if(user)
    return res.status(400).json({errors:"Sorry user with this email already existed"})
    //creating new entry in db
    const salt = await bcrypt.genSalt(10);
  const sucPassword = await bcrypt.hashSync(req.body.password, salt);
    user = await User.create({
        name: req.body.name,
        password: sucPassword,
        email : req.body.email,
      })

      const data = {
        user : {
          id : user.id
        }
      } 
      const authToken = jwt.sign(data,JWT_SECRET)
      res.json(authToken)
    }
    catch(error)
    {
        console.log(error.message);
        res.status(500).send("Some error occured")
    }
    },
  );
//Route 2
  router.post('/login',[
  body('email','Enter a valid email').isEmail(),
  body('password','Enter a valid password').exists(),
  ],async (req,res)=>
  {
     // Finds the validation errors in this request and wraps them in an object with handy functions
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     const {email,password} = req.body
     try{
      let user = await User.findOne({email:email})
      if(!user)
      return res.status(400,'Please login with the correct creds')

      const passwordCompare = await bcrypt.compare(password,user.password)
      if(!passwordCompare)
      return res.status(400,"Please try to login with correct creds")

      const data = {
        user : {
          id : user._id
        }
      }
      const authToken = jwt.sign(data,JWT_SECRET)
      res.json(authToken)
     }catch(error)
     {
      console.error(error.message)
      res.status(500,'Internal servor error')
     }
  })

  router.post('/getuser',fetchUser,async (req,res)=>{
    try {
      const userId = req.user;
      // console.log(req.user)
      const user = await User.findById({"_id":userId.id}).select("-password")
  // console.log(user)
      res.send(user)
    } catch (error) {
      console.error(error.message)
      res.status(500,'Internal servor error')
    }
  })
module.exports = router