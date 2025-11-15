// middleware.js
const Listing = require('./models/listing');
const Review = require('./models/review');

const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');

module.exports.isLoggedIn = (req, res, next) => {
  // make sure passport has initialized req.isAuthenticated
  const isAuthFn = typeof req.isAuthenticated === 'function' && req.isAuthenticated;
  if (!isAuthFn || !req.isAuthenticated()) {
    // remember original url (for GETs) so we can return after login
    if (req.method === 'GET') req.session.returnTo = req.originalUrl || req.url;
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  return next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  // expose returnTo to views (useful in login form hidden input or redirect logic)
  res.locals.returnTo = req.session.returnTo || '/listings';
  next();
};

module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash('error', 'Listing not found.');
      return res.redirect('/listings');
    }

    // handle cases where owner may be stored as ObjectId or populated doc
    const ownerId = listing.owner && listing.owner._id ? listing.owner._id : listing.owner;

    if (!req.user || !ownerId) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/listings/${id}`);
    }

    // compare as strings or using equals if available
    if ((ownerId.equals && !ownerId.equals(req.user._id)) ||
        (ownerId.toString && ownerId.toString() !== req.user._id.toString())) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/listings/${id}`);
    }

    // attach listing for later handlers if helpful
    req.listing = listing;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(400, errMsg));
  }
  return next();
};

module.exports.validateReview = (req, res, next) => {
  // If your form posts review as { review: { rating: ..., body: ... } },
  // keep req.body.review; otherwise change to req.body.
  const payload = req.body.review || req.body;
  const { error } = reviewSchema.validate(payload);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(400, errMsg));
  }
  return next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
      req.flash('error', 'Review not found.');
      return res.redirect(`/listings/${id}`);
    }

    if (!req.user) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/listings/${id}`);
    }

    const authorId = review.author && review.author._id ? review.author._id : review.author;

    if ((authorId.equals && !authorId.equals(req.user._id)) ||
        (authorId.toString && authorId.toString() !== req.user._id.toString())) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/listings/${id}`);
    }

    // attach review if needed downstream
    req.review = review;
    return next();
  } catch (err) {
    return next(err);
  }
};
