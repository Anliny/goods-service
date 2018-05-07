
var mongoose = require('mongoose');

//用户的表结构
// 暴露表结构

module.exports = new mongoose.Schema({
	providerName:String, //进货渠道名称
	goodsName:String,    //商品名称
	goodsNumber:Number,  //商品数量
	price:Number,        //单价
	totalPrice:Number,   //总价
	identifyNumber:String,// 证单号
	isState:Boolean,      // 是否入库
	updateTime:{          //创建时间or修改时间
		type:String,
		content:new Date()
	},
	createTime:String,    //入库时间
	remark:String         //备注
})