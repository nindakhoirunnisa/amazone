const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('../models/product_catalog');

async function getStock(p_id, s_id)
{
  const result = await Product.aggregate(
    [
      {
          $match: {
              _id: p_id,
          }
      },
      {
          $unwind: {
            path: '$stocks'
        }
      },
      {
        $match: {
          "stocks.store_id": s_id
        }
      }
  ]
  );
  return result[0].stocks.stock
};

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
  distance: {
    type: Number
  },
  ETA: {
    type: Number
  },
  // started_at: {
  //   type: Date,
  //   default: Date.now
  // },
  // ended_at: {
  //   type: Date,
  //   default: Date.now
  // },
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
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  name: {
    type: String
  },
  unit_price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    min: 1,
    validate : {
      validator: async function stockValidator(value) {
        let stock = await getStock(this.product_id, this.store_id)
      return value <= stock}, message: "Qty > stock"
    }
  },
  total: {
    type: Number,
    default: function() {
      return (this.quantity * this.unit_price).toFixed(2)
    }
  },
  _id: false
});

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
  postcode: {
    type: String,
    required: true
  },
  location: geojsonSchema,
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
   // autopopulate: true
  },
  store: storeSchema,
  is_fresh: {
    type: Boolean
  },
  partners: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
    //populate: { select: ['name', 'location']}
  },
  // partners: partnerSchema,
  deliveries: deliverySchema,
  shipping_address: shippingSchema,
  items: {
    type: [itemSchema],
    required: true,
    default: undefined
  },
  total_item_price: {
    type: Number,
    required: true
  },
  delivery_fee: {
    type: Number,
    default: function() {
      if (this.is_fresh = true) {
        return 5.34;
      } else {
        return 3.34
      }
    },
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  order_status: {
    type: String,
    default: 'on-cart'
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
  },
},{
  versionKey: false
})

//partnerSchema.index({ store_id: 1 });

const Current_Order = mongoose.model('Current_Order', currentOrderSchema);

module.exports = Current_Order;
