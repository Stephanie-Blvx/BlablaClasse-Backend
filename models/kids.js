const mongoose = require('mongoose');

const kidSchema = mongoose.Schema({
firstname: String,
lastname: String,
birthdate: Date,
allergies: String,
habits: String,
additionalInfo: String,
classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }],
  
});

const Kid = mongoose.model('kids', kidSchema);

module.exports = Kid;
