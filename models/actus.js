const mongoose = require('mongoose');


const actuSchema = mongoose.Schema({
  
  content: String,
  creationDate: Date,
  

});

const Actu = mongoose.model('actus', actuSchema);

module.exports = Actu;