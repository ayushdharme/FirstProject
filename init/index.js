const mongoose = require("mongoose");
const initdata = require("./data.js");
const listing = require("../models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

// Rename main to connectToDb to make it more specific
async function connectToDb(){
    await mongoose.connect(MONGO_URL);
}

connectToDb().then((res)=>{
    console.log("database connection establish");
    console.log(res);
}).catch((err)=>{
    console.log(err);
})


const initDB = async ()=>{
    //deleting the existing data
    await listing.deleteMany({});
    //inserting a new data
    await listing.insertMany(initdata.data);
    console.log("data was initialize");
}

initDB();