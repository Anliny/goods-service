
var mongoose = require('mongoose');

//用户的表结构
// 暴露表结构

module.exports = new mongoose.Schema({
	otherName:String,           //开支人姓名
	travelPrice:Number,         //路费
	foodPrice:Number,           //伙食费
	otherPrice:Number,          //其他费用
	totalPrice:Number,          //总价
	updateTime:{                //创建时间or修改时间
		type:String,
		content:new Date()
	},
	remark:String               //备注
})