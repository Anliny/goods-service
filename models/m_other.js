
var  mongoose = require('mongoose');
//stock   货物提供者
var otherSchema = require('../schemas/s_other.js');

module.exports = mongoose.model('other',otherSchema);