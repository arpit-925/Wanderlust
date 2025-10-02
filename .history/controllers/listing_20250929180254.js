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

module.exports.createListing = async(req,res,next) =>{
  // let{title,description, image, }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  await newListing.save();
  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
  };

  module.exports.renderEditForm = async(req,res) =>{
  let {id} = req.params;
  const  listing = await Listing.findById(id);
  res.render("listings/edit",{listing});
  // res.render("listings/edit", { 
  // listing: { ...listing.toObject(), image: listing.image.url || "" } 


};

module.exports.updateListing = async (req, res) => {
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
  };

  module.exports.destroyListing =async(req,res) =>{
  
  
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};