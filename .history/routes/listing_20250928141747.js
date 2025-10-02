const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema } = require("../schema.js");  
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js"); 

const validateListing =(req,res,next) =>{
  let {error} =listingSchema.validate(req.body);
if(error){
  let errMsg = error.details.map((el) => el.message).join(",");
  throw new ExpressError(400, errMsg);
} else{
  next(); 
}
};


router.get("/", wrapAsync(async (req,res) =>{
  const allListings = await Listing.find({});
   console.log(allListings);
  res.render("listings/index",{ allListings });
}));

router.get("/new",isLoggedIn, (req,res) =>{
 
  res.render("listings/new");
});

router.get("/:id" ,wrapAsync(async (req,res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate("reviews").populate("owner");
  if (!listing){
  //   req.flash("error", "Requested listing do not exist!");
  //  res.redirect("/listings");
  req.flash("error", "Requested listing does not exist!");
return res.redirect("/listings");

  }
  res.render("listings/show", {listing});
}));


router.post("/" ,
  validateListing,
  wrapAsync(async(req,res,next) =>{
  // let{title,description, image, }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
  }

)
);

router.get("/:id/edit" ,isLoggedIn, wrapAsync(async(req,res) =>{
  let {id} = req.params;
  const  listing = await Listing.findById(id);
  // res.render("listings/edit",{listing});
  res.render("listings/edit", { 
  listing: { ...listing.toObject(), image: listing.image.url || "" } 
});

}));


// router.put("/:id" ,
//    validateListing,
//   wrapAsync(async(req,res) =>{
//   let {id} = req.params;
//   await Listing.findByIdAndUpdate(id, {...req.body.listing});
  
//  res.redirect(`/listings/${id}`);
// }));
router.put("/:id",
  isLoggedIn, 
  isOwner,
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      throw new ExpressError(404, "Listing not found");
    }

    // Update text fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // Only update image if a new one is provided
    if (req.body.listing.image?.url) {
      listing.image = req.body.listing.image;
    }

    await listing.save();
    req.flash("success", "Successfully updated a listing!");
    res.redirect(`/listings/${id}`);
  })
);


router.delete("/:id" ,isLoggedIn, wrapAsync(async(req,res) =>{
  
  
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
}));

module.exports = router;