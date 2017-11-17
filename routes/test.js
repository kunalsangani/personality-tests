var express = require('express');
var router = express.Router();

var fs = require('fs');

var mbti = JSON.parse(fs.readFileSync('./public/jsondata/mbti.json','utf8'));

/* GET home page. */
router.get('/mbti', function(req, res, next) {
  res.render('test', { test : mbti });
});

module.exports = router;
