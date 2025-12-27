const express = require("express");
const router = express.Router({mergeParams:true});
const review = require("../models/reviews");
const listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn,isReviewAuthor} = require("../middleware");


//review routes

//creating the new review
router.post("/",
    isLoggedIn,//user should be logged in to post a review
    wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let {rating,comment} = req.body;

    //find the listing with the id and add the reviw
    let list = await listing.findById(id); 
    if(!list){
        req.flash("error","listing not found");
        return res.redirect("/listing");
    }

    let newReview = new review({
        rating:rating,
        comment:comment
    })

    newReview.author = req.user._id;

    list.reviews.push(newReview);
    await newReview.save();
    await list.save();
    
    req.flash("success","review added successfully");
    res.redirect(`/listing/${id}`);
}));

//delete route
router.delete("/:reviewId",
    //here we are adding middlewwares
    isLoggedIn,//for deleting the review user should logged in 
    isReviewAuthor,//for deleting the review you must a author of the review
    async (req,res)=>{
    let {id,reviewId} = req.params;
    console.log("this is review id");
    console.log(reviewId);
    console.log("this is current user")
    console.log(res.locals.currentUser);
    await review.findByIdAndDelete(reviewId);
    await listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});
    req.flash("success","review deleted successfully");
    res.redirect(`/listing/${id}`);
})





module.exports = router;