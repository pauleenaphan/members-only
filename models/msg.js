var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const msgSchema = new Schema({
    subject: { type: String, required: true }, 
    message: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, default: Date.now },
    // formattedDate: { type: String, default: getCurrentFormattedDate }
})

module.exports = mongoose.model("Msg", msgSchema);