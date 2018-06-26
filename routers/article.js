
var express = require('express');

var router = express.Router();



//课程操作
var Article  = require("../models/m_Article");

//类目操作
var Blog  = require("../models/Blog");


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
 *  跳转到博客管理界面    传递用户信息
*/
router.get('/',function (req,res,next) {
	// res.render('admin/article_list',{userInfo:req.userInfo});

	//定义当前页的页数，默认为第一页   req.query.page  获取?page 的值
	var page = Number(req.query.page || 1);
	var limit = 5;      //每页显示的条数
	var count;    //总记录数
	var pages = 0 ;

	//查询总记录数   先查找总页数
	Article.count()
		.then(function (count) {
			count = count;
			pages = Math.ceil(count/limit);   //计算有多少页
			page = Math.min(page,pages);      //分页最大数不能超过总页数
			page = Math.max(page,1);          //最小控制在第一页

			var skip = (page-1)*limit;  //忽略掉的数据条数

			// 分页 limit(number)  每页显示多少条
			//  skip(number)    忽略掉数据的条数
			Article.find()
				.skip(skip)
				.limit(limit)
				.populate('blog')
				.then(function (articles) {
					res.render('admin/article_list',{
						userInfo:req.userInfo,
						articles:articles,
						count:count,
						pages:pages,
						limit:limit,
						page:page,
						url:"/article"
					});
				})
		})
})

/**
 *   跳转到添加文章页
 */
router.get('/add_article',function (req,res) {
	Blog.find().then(function (blogInfo) {
		res.render('admin/article_add',{
			userInfo:req.userInfo,
			blogs:blogInfo,
			title:"添加文章",
		});
	})



})

/**
 * 添加文章
 */
router.post('/add_article',function (req,res) {
	console.log(req.query.id);
	//判断是否纯在当前的文章
	Article.findOne({articleName:req.body.articleName})
		.then(function (articleInfo) {
			//如果已经纯在blog
			if(articleInfo){
				res.render("admin/message",{
					userInfo:req.userInfo,
					message:"该文章已经存在！",
					url:"/article",
					buttom:"跳转至添加文章页"
				})
				return;
			}
			//保存文章信息
			var article = new Article({
				//表联合
				blog:req.body.blog,

				articleName:req.body.articleName,
				articleAuthor:req.body.articleAuthor,
				articleDescribe:req.body.articleDescribe,
				articleContent:req.body.articleContent,
				updateTime:new Date()
			});
			// 保存到数据库
			return article.save();
		})
		.then(function (newArticle) {
			res.render('admin/message',{
				userInfo:req.userInfo,
				message:"添加成功！",
				url:"/article",
				buttom:"跳转至文章列表"
			});

		})
})

/**
 *   删除文章
 */
router.get('/remove',function (req,res) {
	//判断是不否存在
	Article.findOne({_id:req.query.id}).then(function (articleInfo) {
		if(articleInfo){
			Article.remove({"_id":req.query.id}).then(function (success) {
				res.render("admin/message",{
					userInfo:req.userInfo,
					message:"删除成功！",
					url:"/article",
					buttom:"跳转至博客列表！"
				})
			})
		}else{
			res.render("admin/message",{
				userInfo:req.userInfo,
				message:"没有此条记录！",
				url:"/article",
				buttom:"跳转至博客列表！"
			})
		}
	})
})

/**
 *  修改文章
 */
router.get('/update',function (req,res) {
	console.log(req.query);
	var id = req.query.id || "";
	console.log(id);
	var blogs = [];
	Blog.find().sort({_id:1}).then(function (rs) {
		blogs = rs;
		return Article.findOne({_id:id}).populate('blog');
	}).then(function (articleInfo) {
		if(articleInfo){
			res.render("admin/article_edit",{
				userInfo:req.userInfo,
				articleInfo:articleInfo,
				blogs:blogs,
				title:"修改文章"
			})
		}else{
			res.render("admin/message",{
				userInfo:req.userInfo,
				message:"没有此条记录！",
				url:"/article",
				buttom:"跳转至博客列表！"
			})
		}
	})
})
/**
 * 保存修改
 */
router.post('/update',function (req,res) {
	var id = req.query.id || "";
	console.log(req.body.blog);
	if(req.body.blog == ''){
		res.render('admin/message',{
			userInfo:req.userInfo,
			message:'内容分类不能为空'
		})
		return;
	}
	if(req.body.title == ''){
		res.render('admin/message',{
			userInfo:req.userInfo,
			message:'内容标题不能为空'
		})
		return;
	}

	Article.update({_id:id},{
		//表联合
		blog:req.body.blog,

		articleName:req.body.articleName,
		articleAuthor:req.body.articleAuthor,
		articleDescribe:req.body.articleDescribe,
		articleContent:req.body.articleContent,
		updateTime:new Date()
	}).then(function (data) {
		if(data.ok === 1){
			res.render('admin/message',{
				userInfo:req.userInfo,
				message:'文章修改成功!',
				url:"/article",
				buttom:"跳转至博客列表！"
			})
		}
	})
})



module.exports = router;