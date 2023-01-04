const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const geojsonSchema = new Schema({
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

const storeAddress = new Schema({
  unit_no: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  postcode: {
    type: String,
    required: true
  },
  location: geojsonSchema
})

const storeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: storeAddress
},
{
  versionKey: false
});

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
