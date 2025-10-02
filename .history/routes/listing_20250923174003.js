const express = require("express");
const router = express.Router();


router.get("/listings", wrapAsync(async (req,res) =>{
  const allListings = await Listing.find({});
   console.log(allListings);
  res.render("listings/index",{ allListings });
}));

router.get("/listings/new",(req,res) =>{
  res.render("listings/new");
});

router.get("/listings/:id" ,wrapAsync(async (req,res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show", {listing});
}));


router.post("/listings" ,
  validateListing,
  wrapAsync(async(req,res,next) =>{
  // let{title,description, image, }

  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
  }

)
);

router.get("/listings/:id/edit" ,wrapAsync(async(req,res) =>{
  let {id} = req.params;
  const  listing = await Listing.findById(id);
  res.render("listings/edit",{listing});
}));


router.put("/listings/:id" ,
   validateListing,
  wrapAsync(async(req,res) =>{
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
 res.redirect(`/listings/${id}`);
}));


router.delete("/listings/:id" ,wrapAsync(async(req,res) =>{
  
  
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));