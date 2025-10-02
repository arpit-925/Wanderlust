const Listing = require("../models/listing");



module.exports.index = async (req,res) =>{
  const allListings = await Listing.find({});
   console.log(allListings);
  res.render("listings/index",{ allListings });
};

module.exports.renderNewForm = (req,res) =>{
 
  res.render("listings/new");
};

module.exports.showListing = async (req,res) =>{
  let {id} = req.params;
  const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: {
      path: "author",
    },
  }).populate("owner");
  if (!listing){
  //   req.flash("error", "Requested listing do not exist!");
  //  res.redirect("/listings");
  req.flash("error", "Requested listing does not exist!");
return res.redirect("/listings");

  }
  res.render("listings/show", {listing});
};