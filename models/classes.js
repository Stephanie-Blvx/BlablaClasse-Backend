const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
  name: String,
  color: String,
  kids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'kids' }],//plusieurs kids donc tableau d'id kids
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'teachers' }], //plusieurs teachers possibles donc tableau d'id teachers
});

const Class = mongoose.model('classes', classSchema);

module.exports = Class;