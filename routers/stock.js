
var express = require('express');

var router = express.Router();



//课程操作
var Stock  = require("../models/m_stock");


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
router.get('/jumpGoods', (req,res,next) => {
	if(req.query.id === undefined || req.query.id === 'undefined' || req.query.id === ''){
		res.render('admin/stock_add',{
			userInfo:req.userInfo,
			title:'添加货物'
		})
	}else{
		Stock.findOne({_id:req.query.id}).then( (stockInfo) => {
			if(stockInfo){
				res.render("admin/stock_add",{
					userInfo:req.userInfo,
					stockInfo:stockInfo,
					title:"修改货物"
				})
			}else{
				res.render("admin/message",{
					userInfo:req.userInfo,
					message:"没有此条记录！",
					url:"/stock",
					buttom:"跳转至材料列表！"
				})
			}
		})
	}

})

/***
 *   添加进货方法
 */
router.post('/addGoods',(req,res) => {

	if(req.body.id === undefined || req.body.id === ''){
		// 添加进货方法
		Stock.findOne({identifyNumber:req.body.identifyNumber})
			.then((stockInfo) => {
				//如果已经纯在blog
				if(stockInfo){
					res.render("admin/message",{
						userInfo:req.userInfo,
						message:"该证单号已经存在！",
						url:"/stock",
						buttom:"跳转至添加文章页"
					})
					return Promise.reject();
				}
				//保存文章信息
				var stock = new Stock({
					providerName:req.body.providerName,  //进货渠道
					goodsName:req.body.goodsName,        //商品名称
					goodsNumber:req.body.goodsNumber,    //商品数量
					price:req.body.price,                //商品单价
					totalPrice:req.body.goodsNumber * req.body.price,  //商品总价
					identifyNumber:req.body.identifyNumber, //证单号
					isState:false,                          //是否入库
					updateTime:new Date(),                   //创建时间
					createTime:"0000-00-00 00:00:00",        //入库时间
					remark:req.body.remark                   //备注
				});
				// 保存到数据库
				return stock.save();
			})
			.then( (newStock) => {
				res.render('admin/message',{
					userInfo:req.userInfo,
					message:"添加成功！",
					url:"/stock",
					buttom:"跳转至进货渠道列表"
				});
			})
	}else{
		//修改进货的方法
		var id = req.body.id;
		Stock.update({
			_id:id
		},{
			providerName:req.body.providerName,  //进货渠道
			goodsName:req.body.goodsName,        //商品名称
			goodsNumber:req.body.goodsNumber,    //商品数量
			price:req.body.price,                //商品单价
			totalPrice:req.body.goodsNumber * req.body.price,  //商品总价
			identifyNumber:req.body.identifyNumber, //证单号
			updateTime:new Date(),                   //创建时间
			remark:req.body.remark                   //备注
		})
			.then(() => {
				res.render('admin/message', {
					userInfo: req.userInfo,
					message: '商品修改成功！',
					url: '/stock',
					buttom:"跳转至进货渠道列表"
				});
			})

	}

})

/**
 *   进货渠道商品列表
 * **/
router.get("/",(req,res,next) => {
	//定义当前页的页数，默认为第一页   req.query.page  获取?page 的值
	var page = Number(req.query.page || 1);
	var limit = 5;      //每页显示的条数
	var count;    //总记录数
	var pages = 0 ;

	//查询总记录数   先查找总页数
	Stock.count().then( (count) => {
			count = count;
			pages = Math.ceil(count/limit);   //计算有多少页
			page = Math.min(page,pages);      //分页最大数不能超过总页数
			page = Math.max(page,1);          //最小控制在第一页

			var skip = (page-1)*limit;  //忽略掉的数据条数

			// 分页 limit(number)  每页显示多少条
		//  skip(number)    忽略掉数据的条数
			Stock.find({})
				.skip(skip)
				.limit(limit)
				.then( (stocks) => {
					res.render('admin/stock_list',{
						userInfo:req.userInfo,
						stocks:stocks,
						count:count,
						pages:pages,
						limit:limit,
						page:page,
						url:"/stock"
					});
				})
		})
});

/**
 *  查看商品详细列表
 * */
router.get('/showStock',(req,res,next) => {
	var id = req.query.id || "";

	Stock.findOne({_id:id}).then( (stockInfo) => {
		if(stockInfo){
			res.render("admin/stock_show",{
				userInfo:req.userInfo,
				stockInfo:stockInfo,
				title:"查看来料详细信息"
			})
		}else{
			res.render("admin/message",{
				userInfo:req.userInfo,
				message:"没有此条记录！",
				url:"/stock",
				buttom:"跳转至材料列表！"
			})
		}
	})
});

/**
 *  商品入库
 * */
router.get("/saveStock",(req,res,next) => {
	var id = req.query.id || '';
	Stock.update({
		_id:id
	},{
		isState:true,
		createTime:new Date()
	})
		.then(() => {
			res.render('admin/message', {
				userInfo: req.userInfo,
				message: '商品入库成功！',
				url: '/stock',
				buttom:"跳转至进货渠道列表"
			});
		})
});

/**
 *  商品删除
 * */
router.get("/deleteStock",(req,res,next) => {
	var id = req.query.id || '';
	Stock.remove({_id: id})
		.then(() => {
			res.render('admin/message', {
				userInfo: req.userInfo,
				message: '删除成功',
				url: '/stock',
				buttom:"跳转至进货渠道列表"
			});
		});
});

/**
 *  根据证单号查询和是否入库查询
 * */
router.get("/identifyQueryStock",(req,res,next) => {
	var identifyNumber = req.query.identifyNumber;
	var isState = req.query.isState;
	var _filter;
	if(isState == '' || isState == undefined){
		 _filter = {
			identifyNumber:{"$regex":identifyNumber,$options:"$i"}
		}
	}else{
		_filter = {
			identifyNumber:{"$regex":identifyNumber,$options:"$i"},
			isState:isState
		}
	}
	//定义当前页的页数，默认为第一页   req.query.page  获取?page 的值
	var page = Number(req.query.page || 1);
	var limit = 5;      //每页显示的条数
	var count=0;    //总记录数
	var pages = 0 ;
	var skip = (page-1)*limit;

	Stock.count(_filter,  (err, doc) => { // 查询总条数（用于分页）
		if (err) {
			console.log(err)
		} else {
			count = doc
			pages = Math.ceil(count/limit);   //计算有多少页
			page = Math.min(page,pages);      //分页最大数不能超过总页数
			page = Math.max(page,1);          //最小控制在第一页
		}
	})
	Stock.find(_filter)
		.limit(limit) // 最多显示10条
		.sort({'_id': -1}) // 倒序
		.exec(  (err, doc) => { // 回调
			if (err) {
				console.log(err)
				console.log(1)
			} else {
				res.render('admin/stock_list',{
					userInfo:req.userInfo,
					stocks:doc,
					count:count,
					pages:pages,
					limit:limit,
					page:page,
					url:"/stock"
				});
			}
		})
});


module.exports = router;