const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const user = require("../models/user.js");


router.route("/signup")
.get( userController.renderSignUpForm)
.post( wrapAsync(userController.signUp));


// router.route("/login")
// .get( userController.renderLoginForm)
// .post(
//   // saveRedirectUrl,
//   passport.authenticate("local", {failureFlash: true, failureRedirect:"/login"}), userController.login);
router.route("/login")
  .get(userController.renderLoginForm)
  .post((req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Passport authenticate error:", err);
        return next(err);
      }
      if (!user) {
        req.flash("error", info?.message || "Invalid username or password");
        return res.redirect("/login");
      }

      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }

        req.flash("success", "Welcome back!");
        const redirectUrl = req.session.returnTo || "/listings";
        delete req.session.returnTo;
        return res.redirect(redirectUrl);
      });
    })(req, res, next);
  });


  
router.get("/logout",userController.logout); 
  

module.exports = router;