const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const geojsonSchema = new Schema({
  type: {
    type: String,
    default: "Point"
  },
  coordinates: {
    type: [Number],
    required: true
  },
  _id: false
});

const storeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: geojsonSchema,
  _id: false
});

const partnerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  location: geojsonSchema,
  _id: false
});

const deliveryHistorySchema = new Schema({
  
});

const deliverySchema = new Schema({
  fee: {
    type: Number,
    required: true
  },
  started_at: {
    type: Date,
    default: Date.now
  },
  ended_at: {
    type: Date,
    default: Date.now
  },

})

const currentOrderSchema = new Schema({
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

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
