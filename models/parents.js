const mongoose = require('mongoose');

const parentSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    token: String,
    kids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'kids' }], //plusieurs enfants possibles à priori donc tableau d'id kids
   });


const Parent = mongoose.model('parents', parentSchema);

module.exports = Parent;
