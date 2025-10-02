const express = require("express");
const router = express.Router();
const User = require("../models/user.js");

router.get("/signup", (req,res) =>{ 
  res.render("users/signup.ejs");
});


router.post("/signup", async (req,res,next) =>{
  let {email, username, password} = req.body;
  const newUser = new User({email, username});
  let registeredUser = await User.register(newUser, password);
  req.flash("success", "Welcome to Wanderlust");
  res.redirect("/listings");
});

module.exports = router;