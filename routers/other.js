
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
	var id = req.query.id;
	//如果id 为空则为添加,否则为修改

	if(id){
		//根据ID查询该条记录
		Other.findOne({_id:id}).then((other) => {
			if(other){
				res.render('admin/other_add',{
					userInfo:req.userInfo,
					title:'修改开支',
					otherInfo:other
				})
			}
		});
	}else{
		res.render('admin/other_add',{
			userInfo:req.userInfo,
			title:'添加开支'
		})
	}
})
/**
 *  添加和修改其他开支
 * */
router.post('/addOther',(req,res,next) => {
	if(req.body.otherName == '' || req.body.otherName == undefined){
		res.render("admin/message",{
			userInfo:req.userInfo,
			message:"开支人姓名不能为空!",
			url:"/other/jumpOther",
			buttom:"跳转至添加开支界面"
		})
		return Promise.reject();
	}
	console.log(req.body);
	if(req.body.id){
		Other.update(
			{_id:req.body.id},
			{
				otherName:req.body.otherName,
				travelPrice:req.body.travelPrice || 0,
				foodPrice:req.body.foodPrice || 0,
				otherPrice:req.body.otherPrice || 0,
				remark:req.body.remark
			}
		).then(() => {
			res.render('admin/message', {
				userInfo: req.userInfo,
				message: '支出修改成功！',
				url: '/other',
				buttom:"跳转至支出列表"
			});
		})
	}else{
		var other = {
			otherName:req.body.otherName,
			travelPrice:req.body.travelPrice || 0,
			foodPrice:req.body.foodPrice || 0,
			otherPrice:req.body.otherPrice || 0,
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
	}

})
/**
 *  其他开支列表
 * */
router.get("/",(req,res,next) => {
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

/**
 *  删除一条开支
 * */
router.get('/deleteOther',(req,res,next) => {
	var id = req.query.id || '';
	Other.remove({_id: id})
		.then(() => {
			res.render('admin/message', {
				userInfo: req.userInfo,
				message: '删除成功',
				url: '/other',
				buttom:"跳转至其他开支列表"
			});
		});
})

/**
 *  查看详情
 * */
router.get('/showOther',(req,res,next) => {
	var id = req.query.id || "";
	Other.findOne({_id:id})
		.then((otherInfo) => {
			if(otherInfo){
				res.render('admin/other_show', {
					userInfo: req.userInfo,
					otherInfo: otherInfo
				});
			}else{
				res.render('adming/message',{
					userInfo: req.userInfo,
					message: '该开支信息不存在！',
					url: '/other',
					buttom:"跳转至其他开支列表"
				})
			}
		})
})
/**
 *  根据姓名查询
 * */
router.get("/identifyQueryOther",(req,res,next) => {
	var otherName = req.query.otherName;
	// var isState = req.query.isState;
	var _filter;
	// if(isState == '' || isState == undefined){
		_filter = {
			otherName:{"$regex":otherName,$options:"$i"}
		}
	// }else{
	// 	_filter = {
	// 		identifyNumber:{"$regex":identifyNumber,$options:"$i"},
	// 		isState:isState
	// 	}
	// }
	//定义当前页的页数，默认为第一页   req.query.page  获取?page 的值
	var page = Number(req.query.page || 1);
	var limit = 5;      //每页显示的条数
	var count=0;    //总记录数
	var pages = 0 ;
	var skip = (page-1)*limit;

	Other.count(_filter,  (err, doc) => { // 查询总条数（用于分页）
		if (err) {
			console.log(err)
		} else {
			count = doc
			pages = Math.ceil(count/limit);   //计算有多少页
			page = Math.min(page,pages);      //分页最大数不能超过总页数
			page = Math.max(page,1);          //最小控制在第一页
		}
	})
	Other.find(_filter)
		.limit(limit) // 最多显示10条
		.sort({'_id': -1}) // 倒序
		.exec(  (err, doc) => { // 回调
			if (err) {
				console.log(err)
				console.log(1)
			} else {
				res.render('admin/other_list',{
					userInfo:req.userInfo,
					otherList:doc,
					count:count,
					pages:pages,
					limit:limit,
					page:page,
					url:"/other",
					otherName:otherName
				});
			}
		})
});



module.exports = router;