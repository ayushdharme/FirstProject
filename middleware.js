const listing = require("./models/listing");
const review = require("./models/reviews");
function isLoggedIn(req, res, next) {
    console.log(req.originalUrl);
    if (!req.isAuthenticated()) {
        req.session.redirectURL = req.originalUrl;
        req.flash("error", "You must be signed in first");
        return res.redirect("/login");
    }
    next();
};

function saveURL(req, res, next) {
    if (req.session.redirectURL) {
        res.locals.redirectTo = req.session.redirectURL;
    }
    next();
};

async function isOwner(req,res,next){
    let {id} = req.params;
    let data = await listing.findById(id);
    if(data.owner.toString() !== req.user._id.toString()){
        req.flash("error","you are not the owner of this listing");
        return res.redirect(`./listing`);
    }
    next();
};


async function isReviewAuthor(req,res,next){
    let {id,reviewId} = req.params;
    let rev = await review.findById(reviewId);
    if(!rev.author.equals(req.user._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listing/${id}`);
    }
    next();
};

module.exports = {isLoggedIn,saveURL,isOwner,isReviewAuthor};
