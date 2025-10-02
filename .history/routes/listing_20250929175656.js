const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js"); 
const listingController = require("../controllers/listing.js");



router.get("/", wrapAsync(listingController.index));

router.get("/new",isLoggedIn, listingController.renderNewForm);

router.get("/:id" ,wrapAsync(listingController.showListing));


router.post("/" ,
  validateListing,
  wrapAsync(listingController.createListing)
);

router.get("/:id/edit" ,isLoggedIn,
  isOwner, wrapAsync(async(req,res) =>{
  let {id} = req.params;
  const  listing = await Listing.findById(id);
  res.render("listings/edit",{listing});
  // res.render("listings/edit", { 
  // listing: { ...listing.toObject(), image: listing.image.url || "" } 


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