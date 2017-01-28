// CONFIG
var express = require("express");
var router = express.Router();
var passport = require("passport");

// DATA MODELS
var Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    User = require("../models/user");
    
//=================
// INDEX ROUTES *
//=================

// Root route
router.get("/", function(req, res){
   res.render("landing");
});

//==============
// AUTH ROUTES *
//==============

// Register form route
router.get("/register", function(req, res) {
    res.render("register");    
});

// Register form logic route
router.post("/register", function(req, res) {
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

// Login form route
router.get("/login", function(req, res) {
    res.render("login");
});

// Loggin form logic
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res) {
//Callback
});

// Logout route
router.get("/logout", function(req, res) {
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

// EXPORT
module.exports = router;