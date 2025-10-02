const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


let MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() =>{
  console.log("connect to db");
} )
.catch((err) =>{
  console.log(err);
});
async function main(){
  await mongoose.connect(MONGO_URL);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req,res) =>{
  res.send("Hi, i am Arpit");
});

app.get("/listings", ,wrapAsync(async (req,res) =>{
  const allListings = await Listing.find({});
   console.log(allListings);
  res.render("listings/index",{ allListings });
}));

app.get("/listings/new",(req,res) =>{
  res.render("listings/new");
});

app.get("/listings/:id", ,wrapAsync(async (req,res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show", {listing});
}));

app.post("/listings" ,wrapAsync(async(req,res,next) =>{
  // let{title,description, image, }

  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  }

)
);

app.get("/listings/:id/edit", ,wrapAsync(async(req,res) =>{
  let {id} = req.params;
  const  listing = await Listing.findById(id);
  res.render("listings/edit",{listing});
}));


app.put("/listings/:id", ,wrapAsync(async(req,res) =>{
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
 res.redirect(`/listings/${id}`);
}));


app.delete("/listings/:id" ,,wrapAsync(async(req,res) =>{
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));
// app.get("/testListing", async (req,res)=>{
//   let sampleListing = new Listing({
//     title: "My new Villa",
//     description: "By the beach",
//     price: 1200,
//     location:"Calangute , Goa",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("sample saved");
//   res.send("succesful testing");
// });"

app.all("*",(req,res,next) =>{
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) =>{
  let {statusCode, message} = err;
  // res.send("Something went wrong !")
  res.status(status).send(message);
});

app.listen(8080, () =>{
  console.log("server is responding");
});