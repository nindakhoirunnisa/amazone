const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const info = new Schema({
  attribute: {
    type: String
  },
  info: {
    type: String
  }
})

const productDescriptionSchema = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product_Catalog'
  },
  product_description: {
    type: String,
    maxlength: 200,
    required: true
  },
  product_dimension: {
    type: Map,
    of: String,
    required: true
  },
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

module.exports = Product_Description;
