const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  description: String,
  date: Date,
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classes' }] ,
});

const Event = mongoose.model('events', eventSchema);

module.exports = Event;