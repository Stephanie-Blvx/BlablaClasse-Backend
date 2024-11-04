const mongoose = require('mongoose');

const menuSchema = mongoose.Schema({
url: String,
creationDate:Date, 

});

const Menu = mongoose.model('menus', menuSchema);

module.exports = Menu;