/**
 * 应用程序的启动（入口）文件
 *
  */


//加载express文件
var express = require("express");

//创建APP应用
var app = express();

//加载模板处理模块
var swig = require('swig');

//加载数据库模块
var  mongoose = require('mongoose');

//加载核心模块中间件
var bodyParser = require('body-parser');

//加载cookies模块
var Cookies = require('cookies');

//引入 user 模型
var user = require('./models/User');


// 设置静态文件托管
// 返回静态的资源文件
app.use('/public',express.static(__dirname+"/public"));

// 创建 application/x-www-form-urlencoded 解析
app.use(bodyParser.urlencoded({ extended: false }));

//axios （Vue） 提交过来的数据进行解析
app.use(bodyParser.json());

//设置cookie  信息
app.use(function (req,res,next) {
	req.cookies = new Cookies(req,res);

	//解析登录用户的cookie信息
	req.userInfo = {}
	if(req.cookies.get('userInfo')){
		try{
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));

			//获取当前登录的类型，是否是管理员
			user.findById(req.userInfo._id)
				.then(function (userInfo) {
					req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
					next();
				})
		}catch (e){
			next();
		}
	}else{
		next();
	}
});

//定义当前应用所使用的模板引擎
app.engine('html',swig.renderFile);

app.set('views','./views');

app.set('view engine','html');

//在开发过程中，取消缓存模板缓存
swig.setDefaults({cache:false})

/**
 * 根据不同的功能，划分不同的模块
 * admin    后台管理
 * api      接口模块
 * main     普通模块
 * stock    货物提供商
 * other    其他开支模块
 */
app.use('/',require('./routers/main'));
app.use('/api',require('./routers/api'));
app.use('/admin',require('./routers/admin'));
app.use('/article',require('./routers/article'));
app.use('/stock',require('./routers/stock'));
app.use('/other',require('./routers/other'));

//数据库连接
mongoose.connect('mongodb://localhost:27017/goods',{useMongoClient:true},function (err) {
	if (err){
		console.log("数据库连接失败");
	}else{
		console.log("数据库连接成功");
		//监听http请求
		app.listen("8082","localhost",function (error) {
			if(error)
				console.log(error)
			else
				console.log("http://localhost:8082");
		});
	}

})

