
var express = require('express');

var router = express.Router();




router.get('/',function (req,res,next) {
	// res.send('main');
	console.log(req.userInfo);
	// res.render('main/blog-list',{userInfo:req.userInfo});
	res.render('main/index',{userInfo:req.userInfo});

}),





module.exports = router;