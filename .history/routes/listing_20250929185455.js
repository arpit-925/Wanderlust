const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js"); 
const listingController = require("../controllers/listing.js");

router.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn,
  validateListing,
  wrapAsync(listingController.createListing)
);


router.route("/:id")
.get("/:id" ,wrapAsync(listingController.showListing))
.put("/:id",
  isLoggedIn, 
  isOwner,
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete("/:id" ,isLoggedIn, wrapAsync(listingController.destroyListing));




router.get("/new",isLoggedIn, listingController.renderNewForm);






router.get("/:id/edit" ,isLoggedIn,
  isOwner, wrapAsync(listingController.renderEditForm));





module.exports = router;