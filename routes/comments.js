// CONFIG
var express = require("express");
var router = express.Router({mergeParams: true});
var middleware = require("../middleware");

// DATA MODELS
var Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    User = require("../models/user");

// ================
//  COMMENTS ROUTES
// ================

// NEW
router.get("/new", middleware.isLoggedIn, function(req, res) {
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
router.post("/", middleware.isLoggedIn, function(req, res){
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
                    //connect new comment to current user
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
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


// EDIT
router.get("/:comment_id/edit", middleware.isLoggedIn, middleware.isAuthorComment, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, found){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.render("comments/edit", {comment: found, campgroundId: req.params.id});
        }
    }); 
});

// UPDATE
router.put("/:comment_id",middleware.isLoggedIn, middleware.isAuthorComment, function(req, res){
        Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            res.redirect("/campgrounds/"+req.params.id);
        }
    });
});

// DESTROY
router.delete("/:comment_id", middleware.isLoggedIn, middleware.isAuthorComment, function(req, res){
     Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
        } 
        
        res.redirect("/campgrounds/"+req.params.id);
    });
});

// EXPORT
module.exports = router;