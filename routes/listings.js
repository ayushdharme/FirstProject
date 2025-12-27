const express = require("express");
const router = express.Router({mergeParams:true});
const listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn,isOwner} = require("../middleware.js");


//index route
router.get("/",wrapAsync(async (req,res)=>{
    const allListings = await listing.find();
    res.render("./listings/index",{allListings});
}));

//new route
router.get("/new",
    isLoggedIn
    ,(req,res)=>{
    res.render("./listings/new");
});


//creating the new listing
router.post("/",
    isLoggedIn,
    wrapAsync(async (req,res,next)=>{
    let {title,description,image,price,location,country}= req.body;
    console.log(req.user);

    const API_KEY = process.env.GEOCODING_API;
    console.log("API Key from env:", process.env.GEOCODING_API);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    let coordinates = { lat: null, lng: null };
    if (data.status === "OK" && data.results.length > 0) {
        coordinates = data.results[0].geometry.location;
    } else {
        console.log("❌ Geocoding failed:", data.status);
        console.log("Full response:", JSON.stringify(data, null, 2));
    }

    //saving the listing with the coordinates
    let newListing = await listing.create({
        title:title,
        description:description,
        image,
        price:price,
        location:location,
        country:country,
        owner:req.user._id,
        coordinates: {
            type: "Point",
            coordinates: [coordinates.lng,coordinates.lat]
        }
    });

    console.log("this is the saved listing");
    console.log(newListing);
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listing");
}));


//edit routes(edit form) 
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req,res,next)=>{

    let {id} = req.params;
    let data = await listing.findById(id);
    if(!data){
        req.flash("error","The listing you are looking for is not available");
        return res.redirect("/listing");
    }
    res.render("./listings/update",{data});
}));


//show route
router.get("/:id",
    wrapAsync(async (req,res)=>{

    let {id }= req.params;
    let data = await listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author"
        }
    })
    .populate("owner");

    if(!data){
        req.flash("error","The Listing you are looking for is not available");
        return res.redirect("/listing");
    }
    res.render("./listings/show",{data});

}));


//edit routes
router.put("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async (req,res,next)=>{
    // console.log("i am in Edit Page");
    let {id } =req.params;
    let {title,description,image,location,price,country} = req.body;
    
    //if image is not provided then take previous saved image
    if(image){
        await listing.findByIdAndUpdate(id,{image,},{new:true,runValidators:true});
    }
    
    await listing.findByIdAndUpdate(id,{
        title,
        description,
        location,
        price,
        country
    },{new:true,runValidators:true});
    req.flash("success","Successfully updated the listing!");
    res.redirect("/listing");
}));


//delete route
router.delete("/:id", 
    isLoggedIn,
    isOwner,
    wrapAsync(async(req,res)=>{

    let {id} = req.params; 
    await listing.findByIdAndDelete(id);
    req.flash("success","listing deleted successfully");
    res.redirect("/listing");
}));


module.exports = router;