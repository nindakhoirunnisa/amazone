const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recommendation = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  category: {
    type: String
  },
  name: {
    type: String
  },
  selling_price: {
    type: Number
  },
  stock: {
    type: Number
  },
  rating: {
    type: Number
  },
  store_name: {
    type: String
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  _id: false
});

const recommendationSchema = new Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  recommendations: {
    type: [recommendation],
    required: true
  }
}, {
  versionKey: false
})

const Product_Recommendation = mongoose.model('Product_Recommendation', recommendationSchema);

module.exports = Product_Recommendation;
