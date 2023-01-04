const { Number } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  phone: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ["Female", "Male"]
  }
},
{
  versionKey: false
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
