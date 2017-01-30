// DATA MODELS
var Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    User = require("../models/user");

// RETURN OBJ
var middlewareObj = {};


// MIDDLEWARE

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect("/login");
    }
}

middlewareObj.isAuthorCampground = function(req, res, next){
     Campground.findById(req.params.id, function(err, campground){
         if(err){
             console.log(err);
         } else {
             if(campground.author.id.equals(req.user._id)){
                 return next();
             } else {
                 res.redirect("/login ");
             }
         }
     })
}

middlewareObj.isAuthorComment = function(req, res, next){
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
module.exports = middlewareObj;