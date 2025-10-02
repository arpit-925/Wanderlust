const Review = require("../models/review.js");


module.exports.createReview = async(req,res) =>{
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
};