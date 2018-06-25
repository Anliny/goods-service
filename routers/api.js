
var express = require('express');

var router = express.Router();

//引入users 实体类
var User = require('../models/User');

/**
 *  //统一返回格式
 *  code：  0  表示正常(默认)   1 表示错误  2 空值   3 表示其他
 *  message：   输出信息
 */
var responseDate;

router.use(function (req,res,next) {
	responseDate = {
		code:0,
		message:''
	}
	next();     //继续调用下一个router方法
})

router.get('/user',function (req,res,next) {
	res.send('api');
})

/**
 *  用户名注册
 *      1、用户名不能为空
 *      2、密码不能为空
 *      3、两次密码是否一致
 *
 *      1、用户名是否注册
 *          数据库查询
 */

router.post('/user/register',function (req,res,next) {
	console.log(req.body.username);
	//判断用户名是否为空
	if(req.body.username == 'undefined' || req.body.username == ''){
		responseDate.code = 2;
		responseDate.message = '用户名不能为空';
		res.json(responseDate);
		return;
	}

	//判断密码是否为空
	if(req.body.password == 'undefined' || req.body.password == ''){
		responseDate.code = 2;
		responseDate.message = '密码不能为空';
		res.json(responseDate);
		return;
	}

	//判断两次密码是否一致
	if(req.body.password !== req.body.repassword){
		responseDate.code = 3;
		responseDate.message = '两次密码不一致';
		res.json(responseDate);
		return;
	}

	//用户名 是否已经被注册 ，如果数据库中已经存在同名，表示该用户名已经注册
	User.findOne({username:req.body.username})
		.then(function (userInfo) {
			console.log(userInfo);
			if(userInfo){
				//表示数据库中有该记录
				responseDate.code = 3;
				responseDate.message = '用户名已经被注册！'
				res.json(responseDate);
				return;
			}

			//保存用户信息
			var user = new User({
				username:req.body.username,
				password:req.body.password
			});

			// 保存到数据库
			return user.save();
		})
		.then(function (newUserInfo) {
			console.log(newUserInfo);
			responseDate.message = '注册成功';
			res.json(responseDate);
		})

})

/**
 *  登录测试接口
 *
 *
 */
router.post('/user/login',function (req,res,next) {
	console.log(req.body);
	var userName = req.body.username;
	var passWord = req.body.password;
	console.log(userName,passWord);
	//判断用户名是否为空
	if(userName == undefined || userName == ''){
		responseDate.code = 2;
		responseDate.message = '用户名不能为空';
		res.json(responseDate);
		return;
	}

	//判断密码是否为空
	if(passWord == undefined || passWord == ''){
		responseDate.code = 2;
		responseDate.message = '密码不能为空';
		res.json(responseDate);
		return;
	}

	//用户登录
	User.findOne({username:userName,password:passWord})
		.then( (userInfo) => {
			// 如果找不到相关匹配
			if(!userInfo){
				responseDate.code = 2;
				responseDate.message = '用户名或密码错误！'
				console.log('=========================');
				console.log(responseDate);
				res.json(responseDate);
			}else{
				console.log('-------------------------');
				console.log(userInfo)
				//  否者则登录
				responseDate.message = '登录成功！';
				// responseDate.userInfo = {_id:userInfo._id, username:userInfo.username};
				responseDate.userInfo = userInfo;
				//发送cookie信息 到客户端
				req.cookies.set('userInfo',JSON.stringify({_id:userInfo._id, username:userInfo.username}));
				res.json(responseDate);
			}
		})

});

/**
 *  用户退出
 *
 */
router.get("/user/logout",function (req,res) {
	req.cookies.set('userInfo',null);
	res.json(responseDate)
})


module.exports = router;