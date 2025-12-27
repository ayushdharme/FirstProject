const express = require("express");
const router = express.Router({mergeParams:true});
const user = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveURL} = require("../middleware.js");


//register route
//rendering the register form
router.get("/signup",(req,res)=>{
    res.render("./listings/signUp");
});

router.post("/signup",wrapAsync(async(req,res)=>{
    try{

        let {email,username,password} = req.body;
        console.log(email,username,password);
        let newUser = new user({
            email,
            username,
            password
        });
        
        const reguser = await user.register(newUser,password);
        //this is for login automatically after sign up 
        req.login(reguser,(err)=>{
            if(err){
                next(err);
            }
            req.flash("success","Welcome to Wonderlust!");
            res.redirect("/listing");
        });
        
    } catch(e){
        req.flash("error",e.message);
        res.redirect("signup");
    }
}));


//login route
//rendering the login form

router.get("/login",(req,res)=>{
    res.render("./listings/login");
});

router.post("/login",
    saveURL,
    passport.authenticate("local",{failureRedirect:"/login",failureFlash:true})
    ,async(req,res)=>{
        req.flash("success","welcome back!");
        let redirecturl = res.locals.redirectTo || "/listing"
        res.locals.currentUser = req.user; 
        res.redirect(redirecturl);
        console.log("login sucessful");
    }
);



router.get("/logout",(req,res,next)=>{
    req.logout((e)=>{
        if(e){
            next(e);
        }
        req.flash("success","You Have Logged Out");
        res.redirect("/listing");
    })
});

module.exports = router;