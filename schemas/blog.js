
var mongoose = require('mongoose');

//用户的表结构
// 暴露表结构

module.exports = new mongoose.Schema({

	//类目名称
	courseName:String,

	//创建时间
	updateTime:{
		type:String,
		content:new Date()
	},

	//文章描述
	courseDescribe:String
	//作者
	// author:String

})