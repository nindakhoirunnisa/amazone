const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventories = new Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  is_fresh: {
    type: Boolean
  },
  store_name: {
    type: String
  },
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  quantity: {
    type: Number
  },
  _id: false
});

const dailyInventorySchema = new Schema({
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  inventory: {
    type: [inventories],
    required: true
  }
}, {
  versionKey: false
})

const Daily_Inventory = mongoose.model('Daily_Inventory', dailyInventorySchema);

module.exports = Daily_Inventory;
