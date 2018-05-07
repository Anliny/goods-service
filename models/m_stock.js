
var  mongoose = require('mongoose');
//stock   货物提供者
var stockSchema = require('../schemas/s_stock.js');

module.exports = mongoose.model('stock',stockSchema);