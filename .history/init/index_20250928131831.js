const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj)=>({
    ...obj,
    owner:'68d8c52a840cb2b5f29faceb'
  }));
  await Listing.insertMany(initData.data);
  console.log("data initialized ✅");
};

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("connected to db ✅");
    await initDB();
  } catch (err) {
    console.error("DB connection error ❌", err);
  } finally {
    mongoose.connection.close();
  }
}

main();
