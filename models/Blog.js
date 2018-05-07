
var  mongoose = require('mongoose');

var blogSchema = require('../schemas/blog.js');

module.exports = mongoose.model('Blog',blogSchema);