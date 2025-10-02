const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup", (req,res) =>{ 
  res.render("users/signup.ejs");
});


router.post("/signup", wrapAsync(async (req,res,next) =>{
  try{
  let {email, username, password} = req.body;
  const newUser = new User({email, username});
  let registeredUser = await User.register(newUser, password);
  req.flash("success", "Welcome to Wanderlust");
  res.redirect("/listings");
  }
  catch(e){
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}));

router.get("/login", (req,res) =>{  
  res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", {failureFlash: true, failureRedirect:"/login"}), async (req,res) =>{
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect("/listings");
});

module.exports = router;