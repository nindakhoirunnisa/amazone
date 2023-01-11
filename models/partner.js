const { Number } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const geoJsonSchema = new Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  },
  _id: false
});

const partnerSchema = new Schema({
  location: geoJsonSchema,
  name: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  age: {
    type: Number
  },
  phone: {
    type: String,
    minlength: 5,
    maxlength: 50,
    required: true
  },
  is_idle: {
    type: Boolean,
    default: false
  },
  age: {
    type: Number
  },
  account_number: {
    type: String,
    minlength: 6,
    maxlength: 15,
    required: true
  },
  sortcode: {
    type: String,
    minlength: 8,
    maxlength: 8,
    required: true
  },
  gender: {
    type: String,
    enum: ["Female", "Male"]
  }
},
{
  versionKey: false
});

// create a 2dsphere index on the field holding the GeoJSON data
partnerSchema.index({ location: '2dsphere' });

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;
