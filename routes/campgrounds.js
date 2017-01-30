// CONFIG
var express = require("express");
var router = express.Router();
var middleware = require("../middleware")

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
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

//CREATE -
router.post("/", middleware.isLoggedIn, function(req, res){
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

// EDIT
router.get("/:id/edit", middleware.isLoggedIn, middleware.isAuthorCampground, function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, found){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.render("campgrounds/edit", {campground: found});
        }
    }); 
});

// UPDATE
router.put("/:id",middleware.isLoggedIn, middleware.isAuthorCampground, function(req, res){
        Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/");
        } else {
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// DESTROY
router.delete("/:id", middleware.isLoggedIn, middleware.isAuthorCampground, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        } 
        res.redirect("/campgrounds");
    })
})

// EXPORT
module.exports = router;