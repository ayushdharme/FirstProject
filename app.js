require("dotenv").config(); // MUST be at the very top, before routes
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const port = 8080;
const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/expressError");
const expressSession = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const user = require("./models/user");



const listingrouter = require("./routes/listings");
const reviewRouter = require("./routes/reviews");
const userRouter = require("./routes/users");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

let sessionObject = {
    secret:"rikurinka",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
        httpOnly:true,
    }
};
app.use(expressSession(sessionObject));
app.use(flash());

//passport configuration
app.use(passport.initialize());
app.use(passport.session());

//this is for storing the local variables
app.use((req,res,next)=>{
    res.locals.sucess = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
})

// use static authenticate method of model in LocalStrategy
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use("/listing",listingrouter);
app.use("/listing/:id/review",reviewRouter);
app.use("/",userRouter);


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

app.all(/(.*)/,(req,res,next)=>{
    next(new ExpressError(404,"page not found"));
});

//middleware (error handler)
app.use((err,req,res,next)=>{
    let {statusCode=500,message} = err;
    console.log(err);
    res.status(statusCode).render("error",{message});
});

