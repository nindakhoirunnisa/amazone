const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rating = new Schema({
  rate: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  past_order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Past_Order'
  }
});

const stockProduct = new Schema({
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  stock: {
    type: Number,
    required: true
  }
})

const productSchema = new Schema({
  is_fresh: {
    type: Boolean,
    required: true
  },
  category: {
    type: String,
    minlength: 2,
    maxlength: 20,
    required: true
  },
  name: {
    type: String,
    minlength: 5,
    maxlength: 60,
    required: true
  },
  cost_price: {
    type: Number,
    required: true
  },
  selling_price: {
    type: Number,
    required: true
  },
  total_ratings: {
    type: Number
  },
  number_of_ratings: {
    type: Number
  },
  average_rating: {
    type: Number
  },
  ratings: {
    type: [rating],
    default: undefined
  },
  stocks:{
    type: [stockProduct]
  }
},
{
  versionKey: false
});

const Product_Catalog = mongoose.model('Product_Catalog', productSchema);

module.exports = Product_Catalog;
