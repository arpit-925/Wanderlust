if (process.env.NODE_ENV != "production"){
  require("dotenv").config();
}

// console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");





const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL;

main().then(() =>{
  console.log("connect to db");
} )
.catch((err) =>{
  console.log(err);
});
async function main(){
  await mongoose.connect(dbUrl);
}
app.engine("ejs",ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24*60*60,
  crypto:{
    secret: process.env.SECRET,
  },
});

store.on("error", function(e){
  console.log("session store error", e);
});
const sessionOptions ={
  store,
  secret:  process.env.SECRET,
  resave: false,
  saveUninitialized: true,
cookie:{
  expires: Date.now() + 7*24*60*60*1000,
  maxAge: 7*24*60*60*1000,
  httponly: true,

},

};

app.get("/", (req,res) =>{
  res.send("Hi, i am Arpit");
});


app.use(session(sessionOptions) );
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  
  next();
});


// app.get("/demouser", async (req,res) =>{
//   let fakeUser = new User({ 
//      email:"student@gmail.com",
//     username:"arpit"
//   });
//   let newUser = await User.register(fakeUser, "helloworld");
//   res.send(newUser);
// });



app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//error handling    





app.all(/.*/,(req,res,next) =>{
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) =>{
  let {statusCode = 500, message ="Something went Wrong !"} = err;
  // res.send("Something went wrong !")
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs",{err});
});

app.listen(8080, () =>{
  console.log("server is responding");
});