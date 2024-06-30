var express = require('express');
var router = express.Router();
const Message = require("../models/msg");

function getFormattedDate(date) {
  return date.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}


/* GET home page. */
router.get('/', async(req, res, next) =>{
  const msgs = await Message.find().sort({ date: 1 }).exec();
  const formattedMessages = msgs.map(msg => ({
      ...msg.toObject(),
      formattedDate: getFormattedDate(msg.date)
  }));

  res.render("index", {
      msgs: formattedMessages
  });
});

module.exports = router;
