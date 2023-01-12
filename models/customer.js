const { Number } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema = new Schema({
  first_name: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  last_name: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  last_name: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  phone: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  email: {
    type: String
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
