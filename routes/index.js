var express = require('express');
var router = express.Router();

var fs = require('fs');

var mbti_test = JSON.parse(fs.readFileSync('./public/jsondata/mbti-test.json','utf8'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { test : mbti_test });
});

module.exports = router;
