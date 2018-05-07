
var  mongoose = require('mongoose');

var userSchema = require('../schemas/s_articla.js');

module.exports = mongoose.model('m_Article',userSchema);