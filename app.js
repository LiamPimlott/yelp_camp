
//===============
// YELP CAMP    *
// Liam Pimlott *
//===============

//REQUIRING PACKAGES
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");

// REQUIRING ROUTES
var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

// DATA MODELS
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");

// SEEDING DATABASE
//seedDB();

// APP CONFIG
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Bulldogs are the cutest.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MIDDLEWARE
//Passing current user to every route.
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

// USING ROUTES
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use(indexRoutes);

//===========
// LISTENER *
//===========
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server has started.");
});
