
//===============
// YELP CAMP    *
// Liam Pimlott *
//===============

//REQUIRING LIBRARIES
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var seedDB = require("./seeds");
var passport = require("passport");
var LocalStrategy = require("passport-local");

// DATA MODELS
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");

// Seeding Database
seedDB();

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

//=================
// RESTFUL ROUTES *
//=================

// HOME
app.get("/", function(req, res){
   res.render("landing");
});


// INDEX - Campground index
app.get("/index", function(req, res){
    
    //Get all camggrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds});
        }
        
    })
});

// NEW - new campground form
app.get("/index/new", isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

//CREATE -
app.post("/index", function(req, res){
   //get data from form and add to camground array
   var text = req.body.name;
   var image = req.body.image;
   var description = req.body.description;
   var newCampground = {name: text, image:image, description: description};
   Campground.create(newCampground, function(err, newCampground){
        if(err){
            console.log(err)
        } else {
           res.redirect("/index");
        }
    });
});

//SHOW - shows more indo about one or more campgrounds
app.get("/index/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, found){
        if(err){
            console.log(err);
        } else {
            console.log(found);
            res.render("campgrounds/show", {campground: found});
        }
    });   

    //res.send("THIS WILL BE THE SHOW PAGE ONE DAY")
});

// ================
//  COMMENTS ROUTES
// ================

app.get("/index/:id/comments/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            console.log(campground);
            res.render("comments/new.ejs", {campground: campground}); 
        }
    }); 
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
    //lookup campground using id
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log("error");
            res.redirect("/index");
        } else{
            //create new comment
            Comment.create(req.body.comment, function(err, newComment){
                if(err){
                    console.log("ERROR");
                } else {
                    //connect new comment to campground
                    campground.comments.push(newComment);
                    campground.save();
                    //redirect to show page
                    res.redirect('/index/'+campground._id);
                }
            });
        }
    });
});

//==============
// AUTH ROUTES *
//==============

app.get("/register", function(req, res) {
    res.render("register");    
});

app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        } 
        passport.authenticate("local")(req, res, function(){
            res.redirect("/index");
        })
    })
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/index",
        failureRedirect: "/login"
    }), function(req, res) {
//Callback
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

// AUTH MIDDLEWARE

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect("/login");
    }
}

//===========
// LISTENER *
//===========

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server has started.");
});
