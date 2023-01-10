const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const rating = new Schema({
//   rate: {
//     type: Number
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   },
//   customer_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Customer'
//   },
//   past_order_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Past_Order'
//   },
//   _id: false
// });

const stockProduct = new Schema({
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  _id: false
}
)

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
    // default: 0
  },
  number_of_ratings: {
    type: Number
    // default: 0
  },
  average_rating: {
    type: Number
    // default: function() {
    //   return this.total_ratings/this.number_of_ratings
    // }
  },
  // ratings: {
  //   type: [rating],
  //   default: undefined
  // },
  stocks:{
    type: [stockProduct],
    required: true,
    default: undefined
  }
},
{
  versionKey: false
});

const Product_Catalog = mongoose.model('Product_Catalog', productSchema);

module.exports = Product_Catalog;
