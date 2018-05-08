
var express = require('express');

var router = express.Router();

//课程操作
var Other  = require("../models/m_other");

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
 *  1,跳转到进货添加界面    传递用户信息
 *  2,跳转到修改信息界面
*/
router.get('/jumpOther', (req,res,next) => {
	res.render('admin/other_add',{
		userInfo:req.userInfo,
		title:'添加开支'
	})
})
/**
 *  添加其他开支
 * */
router.post('/addOther',(req,res,next) => {
	var other = {
		otherName:req.body.otherName,
		travelPrice:req.body.travelPrice,
		foodPrice:req.body.foodPrice,
		otherPrice:req.body.otherPrice,
		remark:req.body.remark
	}
	new Other({
		otherName:other.otherName,
		travelPrice:other.travelPrice,
		foodPrice:other.foodPrice,
		otherPrice:other.otherPrice,
		totalPrice:Number(other.travelPrice) + Number(other.foodPrice) + Number(other.otherPrice),
		updateTime:new Date(),
		remark:other.remark
	})
		.save()
		.then((otherInfo) => {
			if (otherInfo) {
				console.log("------------------------------");
				console.log(otherInfo);
				console.log("------------------------------");
				res.render("admin/message",{
					userInfo:req.userInfo,
					message:"添加成功!",
					url:"/other",
					buttom:"跳转至添加开支界面"
				})
				return Promise.reject();
			}else{
				res.render("admin/message",{
					userInfo:req.userInfo,
					message:"添加失败！",
					url:"/other/jumpOther",
					buttom:"跳转至添加开支界面"
				})
			}
		})
})
/**
 *  其他开支列表
 * */
router.get("/",(res,req,next) => {
	//定义当前页的页数，默认为第一页   req.query.page  获取?page 的值
	var page = Number(req.query.page || 1);
	var limit = 5;      //每页显示的条数
	var count;    //总记录数
	var pages = 0 ;

	//查询总记录数   先查找总页数
	Other.count().then( (count) => {
		count = count;
		pages = Math.ceil(count/limit);   //计算有多少页
		page = Math.min(page,pages);      //分页最大数不能超过总页数
		page = Math.max(page,1);          //最小控制在第一页

		var skip = (page-1)*limit;  //忽略掉的数据条数

		// 分页 limit(number)  每页显示多少条
		//  skip(number)    忽略掉数据的条数
		Other.find({})
			.skip(skip)
			.limit(limit)
			.then( (otherList) => {
				res.render('admin/other_list',{
					userInfo:req.userInfo,
					otherList:otherList,
					count:count,
					pages:pages,
					limit:limit,
					page:page,
					url:"/other"
				});
			})
	})
})

module.exports = router;