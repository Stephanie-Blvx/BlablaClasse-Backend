const mongoose = require('mongoose');

const teacherSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    email: String,
    password: String,
    token: String,
    isAdmin: Boolean,
    userType: { type: String, default: "teacher" },
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'class' }],//plusieurs kids donc tableau d'id kids

});

const Teacher = mongoose.model('teachers', teacherSchema);

module.exports = Teacher;