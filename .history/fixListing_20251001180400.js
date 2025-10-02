if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const Listing = require("./models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// Connect to MongoDB
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

async function fixListings() {
  // Find listings with empty or missing geometry
  const listings = await Listing.find({
    $or: [
      { geometry: { $exists: false } },
      { "geometry.coordinates": { $size: 0 } }
    ]
  });

  console.log(`Found ${listings.length} listings to update.`);

  for (let listing of listings) {
    try {
      const response = await geocodingClient.forwardGeocode({
        query: listing.location,
        limit: 1
      }).send();

      if (response.body.features && response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
        await listing.save();
        console.log(`✅ Updated "${listing.title}" with coordinates: ${listing.geometry.coordinates}`);
      } else {
        console.log(`⚠️ Could not find coordinates for "${listing.title}"`);
      }
    } catch (err) {
      console.log(`❌ Error updating "${listing.title}":`, err.message);
    }
  }

  console.log("All done!");
  mongoose.connection.close();
}

fixListings();
