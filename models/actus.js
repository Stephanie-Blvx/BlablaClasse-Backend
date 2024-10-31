const mongoose = require('mongoose');


const actuSchema = mongoose.Schema({
  
  content: String,
  
  

});

const Actu = mongoose.model('actus', actuSchema);

module.exports = Actu;