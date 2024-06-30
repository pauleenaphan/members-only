var express = require('express');
var router = express.Router();
const User = require("../models/user");
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

router.get("/home", async(req, res) => {
    // const user = await User.findById(req.user.id);
    // const isMember = user.memberstatus;
    // console.log(isMember);
    res.render("homepage"); // Render your homepage template
});

//!Sign up routers
router.get("/sign-up", (req, res) => 
    res.render("signupform")
);

router.post("/sign-up", [
    body("name", "Name must not be empty").trim().isLength({ min: 1 }).escape(),
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

    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash password

    const user = new User({
        name: req.body.name, 
        email: req.body.email,
        password: hashedPassword,
    });

    if(!errors.isEmpty()){
        res.render("signupform", {
            user: req.body,
            errors: errors.array()
        });
    } else {
        try {
            await user.save();
             // Automatically log in the user after signup
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
            });
            res.redirect("/auth/home");
        } catch(err) {
            next(err);
        }
    }
});

//!Login routers
router.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

router.get("/log-in", (req, res) => {
    res.render("loginform"); // Ensure you have a 'loginform' template
});

router.post('/log-in', passport.authenticate('local', {
    successRedirect: '/auth/home',
    failureRedirect: '/error',
}));

router.get("/log-out", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

//!Club page routers
router.get("/clubpage", (req,res) =>{
    res.render("joinclub");
})

router.post("/clubpage", async (req, res) =>{
    body("passcode", "Passcode must not be empty").trim().isLength({ min: 1 }).escape()

    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
        return res.render("joinclub", {
            errors: errors.array() 
        });
    }

    // Check the passcode
    if(req.body.passcode !== "chicken") {
        //if passcode is wrong then render the form again with the error msg
        return res.render("joinclub", {
            errors: [{ msg: "Wrong passcode! Try again" }] // Pass error message as an array
        });
    }else{ 
        try{
            //sets user's membership status to true
            console.log("REQ USER", req.user);
            console.log("CURRENT SESSION ID", req.user.id);
            await User.findByIdAndUpdate(req.user.id, { memberstatus: true })
            res.redirect("/auth/home");
        }catch(error){
            console.log("error ", error);
        }
    }
})

module.exports = router; // Export the router object
