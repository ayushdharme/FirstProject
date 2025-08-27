const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const port = 8080;
const listing = require("./models/listing");
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/expressError");


app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


async function connectToDb(){
    await mongoose.connect(MONGO_URL);
};

connectToDb().then((res)=>{
    console.log("database connection establish");
    // console.log(res);
}).catch((err)=>{
    console.log(err);
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

app.get("/", (req, res) => {
    res.send("hiii");
});


//show routes(showing all the listings)
app.get("/listing",wrapAsync(async (req,res)=>{
    const allListings = await listing.find();
    // console.log(allListings);
    res.render("./listings/index",{allListings});
}));

//new show form
app.get("/listing/new",(req,res)=>{
    res.render("./listings/new");
});


//creating the new listing
app.post("/listing",wrapAsync(async (req,res,next)=>{
    let {title,description,image,price,location,country}= req.body;
    console.log(req.body);

    let newListing = await listing.create({
        title:title,
        description:description,
        image:{
            url:image
        },
        price:price,
        location:location,
        country:country
    })
    res.redirect("/listing");
}));


//edit routes(indivisual) for showing the edit form
app.get("/listing/:id/edit",wrapAsync(async (req,res,next)=>{

    let {id} = req.params;
    let data = await listing.findById(id);
    if(!data){
        res.status(400).send("listing not found");
    }
    res.render("./listings/update",{data});

}));


//for showing individual listing
app.get("/listing/:id",wrapAsync(async (req,res)=>{

    let {id }= req.params;
    let data = await listing.findById(id);
    if(!data){
        res.status(400).send("List is not available");
    }
    res.render("./listings/show",{data});

}));


//edit routes
app.put("/listing/:id",wrapAsync(async (req,res,next)=>{
    let {id } =req.params;
    let {title,description,image,location,price,country} = req.body;

    await listing.findByIdAndUpdate(id,{
        title,
        description,
        location,
        image:{
           url:image
        },
        price,
        country
    },{new:true,runValidators:true});
    res.redirect("/listing");
}));


//delete route
app.delete("/listing/:id", wrapAsync(async(req,res)=>{

    let {id} = req.params;
    await listing.findByIdAndDelete(id);
    res.redirect("/listing");

}));

// There is a problem with express 5+, it's using path-to-regexp library, and they changed the rules.
//
// Instead of using:
//
// .get('/**', xxxx) / .get('/*', xxxx)
// Use this workaround:
//
// .get('/*\w', xxxx)
app.all(/(.*)/,(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});


//middleware (error handler)
app.use((err,req,res,next)=>{
    let {statusCode=500,message} = err;
    res.status(statusCode).render("error",{message});
});







//for testing purpose
// app.get("/list", async (req, res) => {

//     const newlisting = new listing({
//         title:"balaghat",
//         description:"kya bolti bala ghat ki public",
//         price:2340,
//         location:"nagpur",
//         country:"india"
//     })
//     await newlisting.save();
//     console.log("saple was save");
//     res.send("succefull");
// });

