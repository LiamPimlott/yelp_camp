// CONFIG
var express = require("express");
var router = express.Router();

// DATA MODELS
var Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    User = require("../models/user");

//====================
// CAMPGROUND ROUTES&*
//====================

// INDEX - Campground index
router.get("/", function(req, res){
    
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allCampgrounds});
        }
        
    })
});

// NEW - new campground form
router.get("/new", isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

//CREATE -
router.post("/", isLoggedIn, function(req, res){
   //get data from form and add to camground array
    var text = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: text, image:image, description: description};
    Campground.create(newCampground, function(err, newCampground){
        if(err){
            console.log(err)
        } else {
            //connect new comment to current user
            newCampground.author.id = req.user._id;
            newCampground.author.username = req.user.username;
            newCampground.save();
            console.log(newCampground);
            res.redirect("/campgrounds");
        }
    });
});

//SHOW - shows more indo about one or more campgrounds
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, found){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: found});
        }
    });   

    //res.send("THIS WILL BE THE SHOW PAGE ONE DAY")
});

// AUTH MIDDLEWARE
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect("/login");
    }
}

// EXPORT
module.exports = router;