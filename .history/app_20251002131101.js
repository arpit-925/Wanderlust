// if (process.env.NODE_ENV != "production"){
//   require("dotenv").config();
// }

// // console.log(process.env.SECRET);


// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");

// const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema , reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
// const session = require("express-session");
// const flash = require("connect-flash");
// const passport = require("passport");
// const LocalStrategy = require("passport-local");
// const User = require("./models/user.js");





// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const userRouter = require("./routes/user.js");


// // let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl = process.env.ATLASDB_URL;

// main().then(() =>{
//   console.log("connect to db");
// } )
// .catch((err) =>{
//   console.log(err);
// });
// async function main(){
//   await mongoose.connect(dbUrl);
// }
// app.engine("ejs",ejsMate);
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname,"views"));
// app.use(express.urlencoded({extended: true}));
// app.use(methodOverride("_method"));

// app.use(express.static(path.join(__dirname,"/public")));
// const sessionOptions ={
//   secret: "mysupersecretcode",
//   resave: false,
//   saveUninitialized: true,
// cookie:{
//   expires: Date.now() + 7*24*60*60*1000,
//   maxAge: 7*24*60*60*1000,
//   httponly: true,

// },

// };

// app.get("/", (req,res) =>{
//   res.send("Hi, i am Arpit");
// });


// app.use(session(sessionOptions) );
// app.use(flash());


// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req,res,next) =>{
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currentUser = req.user;
  
//   next();
// });


// // app.get("/demouser", async (req,res) =>{
// //   let fakeUser = new User({ 
// //      email:"student@gmail.com",
// //     username:"arpit"
// //   });
// //   let newUser = await User.register(fakeUser, "helloworld");
// //   res.send(newUser);
// // });


// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter);
// app.use("/", userRouter);

// //error handling    





// app.all(/.*/,(req,res,next) =>{
//   next(new ExpressError(404, "Page not found!"));
// });

// app.use((err, req, res, next) =>{
//   let {statusCode = 500, message ="Something went Wrong !"} = err;
//   // res.send("Something went wrong !")
//   // res.status(statusCode).send(message);
//   res.status(statusCode).render("error.ejs",{err});
// });

// app.listen(8080, () =>{
//   console.log("server is responding");
// });


if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");

const ExpressError = require("./utils/ExpressError");
const { listingSchema, reviewSchema } = require("./schema");

const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

// ---------------- MONGODB CONNECTION ----------------
const dbUrl = process.env.ATLASDB_URL;

async function main() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
    });
    console.log("✅ Connected to MongoDB Atlas");

    // ---------------- START SERVER ----------------
    app.listen(8080, () => {
      console.log("🚀 Server running at http://localhost:8080");
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Stop app if DB connection fails
  }
}

main();

// ---------------- EXPRESS APP SETUP ----------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ---------------- SESSION & FLASH ----------------
const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ---------------- PASSPORT AUTH ----------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------------- GLOBAL VARIABLES FOR TEMPLATES ----------------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ---------------- ROUTES ----------------
app.get("/", (req, res) => {
  res.send("Hi, I am Arpit");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ---------------- ERROR HANDLING ----------------
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  res.status(statusCode).render("error", { err });
});
