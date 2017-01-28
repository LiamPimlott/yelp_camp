// CONFIG
var express = require("express");
var router = express.Router({mergeParams: true});

// DATA MODELS
var Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    User = require("../models/user");

// ================
//  COMMENTS ROUTES
// ================

// NEW
router.get("/new", isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            console.log(campground);
            res.render("comments/new.ejs", {campground: campground}); 
        }
    }); 
});

// CREATE
router.post("/", isLoggedIn, function(req, res){
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
                    res.redirect('/campgrounds/'+campground._id);
                }
            });
        }
    });
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