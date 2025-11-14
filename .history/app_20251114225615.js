// app.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// New places API route (for category tapping)
let placesRouter;
try {
  placesRouter = require("./routes/places");
} catch (e) {
  // if the file doesn't exist yet, we'll mount a simple placeholder to avoid crashes
  placesRouter = express.Router();
  placesRouter.get("/", (req, res) => res.json([]));
}

// ---------- Config & DB ----------
const dbUrl = process.env.ATLASDB_URL || "mongodb://localhost:27017/wanderlust";

// Connect to MongoDB with basic error handling
mongoose.set("strictQuery", true);
async function main() {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}
main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// ---------- View engine ----------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------- Security & Logging Middlewares ----------
app.use(helmet());

// Simple CORS whitelist support (set CORS_WHITELIST env as comma-separated origins)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const CORS_WHITELIST = (process.env.CORS_WHITELIST || CLIENT_ORIGIN)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow non-browser tools (Postman, mobile) with no origin
      if (!origin) return callback(null, true);
      if (CORS_WHITELIST.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: This origin is not allowed"));
    },
    credentials: true,
  })
);

// Logging in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Body parsing limits: protect from huge payloads
app.use(express.json({ limit: "10mb" })); // for API requests
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // for form posts
app.use(methodOverride("_method"));

// ---------- Static files ----------
app.use(express.static(path.join(__dirname, "public")));

// ---------- Session store ----------
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: process.env.SECRET,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
  store,
  name: "session", // custom cookie name if you want
  secret: process.env.SECRET || "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    // secure: true // uncomment when serving over HTTPS
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ---------- Passport ----------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ---------- Flash & locals ----------
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ---------- Rate limiting for API routes (tune as required) ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // limit per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", apiLimiter);

// ---------- Routes ----------
// Keep your existing app routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Mount places API for category filtering used by topCategories client JS
app.use("/api/places", placesRouter);

// A basic health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ---------- 404 & error handling ----------
app.all("/*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  console.error("Error middleware:", err);
  res.status(statusCode).render("error.ejs", { err });
});

// ---------- Graceful shutdown ----------
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.disconnect();
      console.log("Mongo disconnected. Exiting.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force exit after 10s
  setTimeout(() => {
    console.error("Forcing shutdown...");
    process.exit(1);
  }, 10 * 1000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Export app for testing if needed
module.exports = app;
