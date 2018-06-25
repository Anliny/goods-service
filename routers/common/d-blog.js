
var express = require('express');

var router = express.Router();



//课程操作
var Article  = require("../../models/m_Article");

//类目操作
var Blog  = require("../../models/Blog");

var state = {
	code:0,
	msg:'成功！'
}
/**
 *  跳转到博客管理界面    传递用户信息
 */
router.get('/', (req,res,next) => {
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
					var responseDate = {
						articles:articles,
						pageObj:{
							count:count,
							pages:pages,
							limit:limit,
							page:page
						},
						state
					}
					res.json(responseDate);
				})
		})
})

module.exports = router;