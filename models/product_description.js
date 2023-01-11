// const { Number } = require('mongoose');
const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const info = new Schema({
  attribute: {
    type: String
  },
  info: {
    type: String
  },
  _id: false
});

const dimension = new Schema({
  length: {
    type: Number
  },
  breadth: {
    type: Number
  },
  height: {
    type: Number
  },
  _id: false
})

const productDescriptionSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product_Catalog'
  },
  product_description: {
    type: String,
    maxlength: 1000,
    required: true
  },
  product_dimensions: dimension,
  product_weight: {
    type: Number,
    required: true
  },
  expiry_date: {
    type: Date,

  },
  origin_country: {
    type: String
  },
  additional_info: {
    type: [info],
    default: undefined
  }
},
{
  versionKey: false
});

const Product_Description = mongoose.model('Product_Description', productDescriptionSchema);

//need to add index!
//add condition for expiry_date and origin_country

module.exports = Product_Description;
