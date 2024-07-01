var express = require('express');
var router = express.Router();
const User = require("../models/user");
const Message = require("../models/msg");
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs'); // Import bcryptjs for password hashing

function getFormattedDate(date) {
    return date.toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}

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
    }else{
        await user.save();
        res.redirect('/auth/log-in');
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

//!Home routers
router.get("/home", async(req, res) => {
    const msgs = await Message.find().sort({ date: 1 }).exec();
    const formattedMessages = msgs.map(msg => ({
        ...msg.toObject(),
        formattedDate: getFormattedDate(msg.date)
    }));


    res.render("homepage", {
        msgs: formattedMessages,
        status: req.user.memberstatus
    });
});

//!Club page routers
router.get("/clubpage", (req, res) =>{
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
            await User.findByIdAndUpdate(req.user.id, { memberstatus: true })
            res.redirect("/auth/home");
        }catch(error){
            console.log("error ", error);
        }
    }
})

//!New message routers
router.get("/newmsg", (req, res) =>{
    res.render("msgform", {
        status: req.user.memberstatus
    });
})

router.post("/newmsg", async(req, res) =>{
    body("subject", "Subject must not be empty").trim().isLength({ min: 1 }).escape(),
    body("message", "Message must not be empty").trim().isLength({ min: 1 }).escape()

    const errors = validationResult(req);

    const msg = new Message({
        subject: req.body.subject,
        message: req.body.message,
        author: req.user.name,
    })

    if(!errors.isEmpty()){
        res.render("msgform", {
            msg: req.body,
            errors: errors.array(),
            status: req.user.memberstatus
        })
    }else{
        await msg.save();
        res.redirect("/auth/home");
    }
})


module.exports = router; // Export the router object
