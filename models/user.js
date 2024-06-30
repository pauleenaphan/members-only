var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    memberstatus: { type: Boolean, default: false }
})

module.exports = mongoose.model("User", userSchema);
