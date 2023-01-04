const { Number } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerRatingSchema = new Schema({
  partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  //need to change this
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pas'
  },
  unit_no: {
    type: String,
    minlength: 1,
    maxlength: 3,
    required: true
  },
  street: {
    type: String,
    minlength: 5,
    required: true
  },
  city: {
    type: String,
    minlength: 3,
    required: true
  },
  country: {
    type: String,
    minlength: 3,
    required: true
  },
  postcode: {
    type: String,
    minlength: 6,
    required: true
  },
  location: geojsonSchema
},
{
  versionKey: false
});

const Customer_Address = mongoose.model('Customer_Address', customerAddressSchema);

module.exports = Customer_Address;
