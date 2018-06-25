
var express = require('express');

var router = express.Router();

//查找用户列表
var User = require("../models/User");

//课程操作
var Blog = require("../models/Blog");


//判断是否是管理员，如果不是管理员则不允许进入
router.use(function (req,res,next) {
	if(!req.userInfo.isAdmin){
		//如果不是管理员
		// res.send('你还没有权限进入！只有管理员才能进入');
		res.redirect('./');
		return;
	}
	next();
})

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

/**
 *  跳转到博客管理界面    传递用户信息
 */
router.get('/',function (req,res,next) {
	res.render('admin/index',{userInfo:req.userInfo});
})

/**
 *   查询所有用户信息
 *
 */
router.get("/users",function (req,res,next) {
	//定义当前页的页数，默认为第一页   req.query.page  获取?page 的值
	var page = Number(req.query.page || 1);
	var limit = 5;      //每页显示的条数
	var count;    //总记录数
	var pages = 0 ;


	//查询总记录数   先查找总页数
	User.count()
		.then(function (count) {
			count = count;
			pages = Math.ceil(count/limit);   //计算有多少页
			page = Math.min(page,pages);      //分页最大数不能超过总页数
			page = Math.max(page,1);          //最小控制在第一页

			var skip = (page-1)*limit;  //忽略掉的数据条数

			// 分页 limit(number)  每页显示多少条
			//  skip(number)    忽略掉数据的条数
			User.find()
				.skip(skip)
				.limit(limit)
				.then(function (users) {
					responseDate = {
						code:2,
						message:{
							userInfo:req.userInfo,
							users:users,
							count:count,
							pages:pages,
							limit:limit,
							page:page,
							url:"/admin/users"
						}
					}

					res.json(responseDate);


					// res.render('admin/user_list',{
					// 	userInfo:req.userInfo,
					// 	users:users,
					// 	count:count,
					// 	pages:pages,
					// 	limit:limit,
					// 	page:page,
					// 	url:"/admin/users"
					// });
				})
		})


})

/**
 *  删除单个用户
 */
router.get("/user/delete",function (req,res) {
	console.log(req.query.id);
	User.findOne({_id:req.query.id}).then(function (user) {
		console.log(user);
		if(user){
			User.remove({_id:req.query.id}).then(function (success) {
				res.render('admin/message',{
					userInfo:req.userInfo,
					message:"用户删除成功！",
					url:"/admin/users",
					buttom:"跳转至用户列表！"
				});
			})
		}else{
			console.log("查无此人");
		}
	})

})


/**
 *  博客列表
 */
router.get('/blogs',function (req,res,next) {

	//定义当前页的页数，默认为第一页   req.query.page  获取?page 的值
	var page = Number(req.query.page || 1);
	var limit = 5;      //每页显示的条数
	var count;    //总记录数
	var pages = 0 ;

	//查询总记录数   先查找总页数
	Blog.count()
		.then(function (count) {
			count = count;
			pages = Math.ceil(count/limit);   //计算有多少页
			page = Math.min(page,pages);      //分页最大数不能超过总页数
			page = Math.max(page,1);          //最小控制在第一页

			var skip = (page-1)*limit;  //忽略掉的数据条数

			// 分页 limit(number)  每页显示多少条
			//  skip(number)    忽略掉数据的条数
			Blog.find()
				.skip(skip)
				.limit(limit)
				.then(function (blogs) {
					responseDate = {
						code:1,
						message:{
							userInfo:req.userInfo,
							blogs:blogs,
							count:count,
							pages:pages,
							limit:limit,
							page:page,
							url:"/admin/users"
						}
					}

					res.json(responseDate);

					// res.render('admin/blog_list',{
					// 	userInfo:req.userInfo,
					// 	blogs:blogs,
					// 	count:count,
					// 	pages:pages,
					// 	limit:limit,
					// 	page:page,
					// 	url:"/admin/blogs"
					// });
				})
		})


})

/**
 *  添加博客
 */
router.get("/addBlog",function (req,res) {
	// res.render('admin/blog_add',{userInfo:req.userInfo});
	res.render('admin/blog_add',{
		userInfo:req.userInfo,
		title:"添加博客"
	});
})

/**
 *  保存添加的博客
 */
router.post("/addBlog",function (req,res) {
	//判断是存在本blog
	Blog.findOne({courseName:req.body.courseName})
		.then(function (blogInfo) {
			//如果已经纯在blog
			if(blogInfo){
				//表示数据库中有该记录
				responseDate.code = 3;
				responseDate.message = '该博客已经存在！'
				res.json(responseDate);
				return;
			}
			//保存用户信息
			var blog = new Blog({
				courseName:req.body.courseName,
				courseDescribe:req.body.courseDescribe,
				updateTime:new Date()
			});
			// 保存到数据库
			return blog.save();
		})
		.then(function (newblog) {
			res.render('admin/message',{
				userInfo:req.userInfo,
				message:"添加成功！",
				url:"/admin/blogs",
				buttom:"跳转至博客列表！"
			});
		})
})


/**
 *   删除课程名称
 *
 * */
router.get('/removeBlog',function (req,res) {
	//判断是不否存在

	Blog.findOne({_id:req.query.id}).then(function (blogInfo) {
		if(blogInfo){
			Blog.remove({"_id":req.query.id}).then(function (success) {
				responseDate = {
					code:1,
					message:"删除成功！"
				}
				res.json(responseDate);
				// res.render("admin/message",{
				// 	userInfo:req.userInfo,
				// 	message:"删除成功！",
				// 	url:"/admin/blogs",
				// 	buttom:"跳转至博客列表！"
				// })
			})
		}else{
			responseDate = {
				code:2,
				message:"没有此条记录！"
			}
			res.json(responseDate);
			// res.render("admin/message",{
			//
			// 	userInfo:req.userInfo,
			// 	message:"没有此条记录！",
			// 	url:"/admin/blogs",
			// 	buttom:"跳转至博客列表！"
			// })
		}
	})
})

/**
 *    修改博客名称
 *
 */
router.get("/blog/update",function (req,res) {
	//判断是否存在此条记录
	Blog.findOne({_id:req.query.id}).then(function (blogInfo) {
		console.log(blogInfo);
		if(blogInfo){
			res.render('admin/blog_add',{
				userInfo:req.userInfo,
				title:"修改博客",
				blogInfo:blogInfo
			});
		}else{
			res.render("admin/message",{
				userInfo:req.userInfo,
				message:"没有此条记录！",
				url:"/admin/blogs",
				buttom:"跳转至博客列表！"
			})
		}
	})
})




module.exports = router;