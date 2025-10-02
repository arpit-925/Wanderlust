const express = require("express");
// const router = express.Router();
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview, isLoggedIn } = require("../middleware.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");




router.post("/",
  isLoggedIn,
  validateReview,wrapAsync(async(req,res) =>{
   let listing = await Listing.findById(req.params.id);
   if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

   let newReview = new Review(req.body);
newReview.author = req.user._id;
   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();
   req.flash("success", "Successfully added a new review!");
res.redirect(`/listings/${listing._id}`);
}));


//delete review route
router.delete("/:reviewId", wrapAsync(async(req,res) =>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review !");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;