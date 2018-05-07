
var mongoose = require('mongoose');

//文章的表结构
// 暴露表结构

module.exports = new mongoose.Schema({

	//文章标题
	articleName:String,

	//描述
	articleDescribe:String,

	//正文
	articleContent:String,

	//作者
	articleAuthor:String,

	//创建时间
	updateTime:{
		type:String,
		content:new Date()
	},

	//关联字段
	blog:{
		//关联类型
		type:mongoose.Schema.Types.ObjectId,
		//引用
		ref:'Blog'
	}




})