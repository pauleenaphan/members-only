var express = require('express');
var router = express.Router();
const User = require("../models/user");
const passport = require('passport');
const { body, validationResult } = require('express-validator');


//routes for user signup
router.get("/sign-up", (req, res) => 
    res.render("signupform")
);

router.post("/sign-up", [
    body("email", "Email must not be empty").trim().isLength({ min: 1 }).escape(),
    body("password", "Password must not be empty").trim().isLength({ min: 1 }).escape(),
    body("confirmPassword", "Password must match").custom((val, { req }) =>{
        if(val !== req.body.password){
            throw new Error("Passwords don't match");
        }
        return true;
    })
], async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    if(!errors.isEmpty()){
        res.render("signupform", {
            user: req.body,
            errors: errors.array()
        });
    } else {
        try {
            await user.save();
            res.redirect("/home");
        } catch(err) {
            next(err);
        }
    }
});

//routes for login
router.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

router.get("/log-in", (req, res) => {
    res.render("loginform"); // Ensure you have a 'loginform' template
});

router.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/"
    })
);

router.get("/log-out", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router; // Export the router object
