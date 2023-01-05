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

const historySchema = new Schema({
  name: {
    type: String,
    default: 'Created'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  _id: false
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
  order_delivery_status_histories: {
    type: [historySchema],
    default: undefined
  },
  _id: false
});

const itemSchema = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  unit_price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    min: 1,
    max: 100 //change to stock
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    require: true
  },
  is_fresh: {
    type: Boolean,
    default: false
  },
  _id: false
})

const shippingSchema = new Schema({
  name:{
    type: String,
    required: true
  },
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
  _id: false
});

const currentOrderSchema = new Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Customer'
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Store'
  },
  store: storeSchema,
  partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Partner'
  },
  partners: partnerSchema,
  deliveries: deliverySchema,
  shipping_address: shippingSchema,
  items: {
    type: [itemSchema],
    required: true,
    default: undefined
  },
  total_item_price: {
    type: Number
  },
  total_amount: {
    type: Number
  },
  order_status: {
    type: String,
    default: 'Created'
  },
  is_paid: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  order_status_histories: {
    type: [historySchema],
    default: undefined
  }
})

partnerSchema.index({ store_id: 1 });

const Current_Order = mongoose.model('Current_Order', currentOrderSchema);

module.exports = Current_Order;
