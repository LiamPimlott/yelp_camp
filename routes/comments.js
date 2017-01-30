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
router.get("/:comment_id/edit", isLoggedIn, isAuthor, function(req, res) {
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
router.put("/:comment_id",isLoggedIn, isAuthor, function(req, res){
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
router.delete("/:comment_id", isLoggedIn, isAuthor, function(req, res){
     Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
        } 
        
        res.redirect("/campgrounds/"+req.params.id);
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

function isAuthor(req, res, next){
     Comment.findById(req.params.comment_id, function(err, comment){
         if(err){
             console.log(err);
         } else {
             if(comment.author.id.equals(req.user._id)){
                 return next();
             } else {
                 res.redirect("/login ");
             }
         }
     })
}

// EXPORT
module.exports = router;