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
  isOwner, wrapAsync(listingController.renderEditForm));


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
  wrapAsync(listingController.updateListing)
);


router.delete("/:id" ,isLoggedIn, wrapAsync(listingController.destroyListing));

module.exports = router;