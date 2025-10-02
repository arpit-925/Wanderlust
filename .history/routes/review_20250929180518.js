const express = require("express");
// const router = express.Router();
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const reviewController = require("../controllers/review.js");



router.post("/",
  isLoggedIn,
  validateReview,wrapAsync(reviewController.createReview));


//delete review route
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
   wrapAsync(async(req,res) =>{
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review !");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;