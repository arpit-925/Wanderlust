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
let url = req.file.path;
let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url, filename};
  await newListing.save();
  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
  };

  module.exports.renderEditForm = async(req,res) =>{
  let {id} = req.params;
  const  listing = await Listing.findById(id);
  if(!listing){
    req.flash("error", "Requested listing do not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl =listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
  res.render("listings/edit", {listing});

};

module.exports.updateListing = async (req, res) => {
  
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing });
    if(typeof req.file !== 'undefined'){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
       await listing.save();
    }

   
    req.flash("success", "Successfully updated a listing!");
    res.redirect(`/listings/${id}`);
  };

  module.exports.destroyListing =async(req,res) =>{
  
  
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};