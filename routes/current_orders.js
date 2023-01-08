const express = require('express');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const router = express.Router();
const Current_Order = require('../models/current_order');
const Partner = require('../models/partner');
const Store = require('../models/store');
const Customer_Address = require('../models/customer_address');
const Customer = require('../models/customer');
const Product = require('../models/product_catalog');

module.exports = router;

router.get('/', (req, res, next) => {
  Current_Order.find().populate('partners', {'is_idle': 0, 'account_number': 0, "sortcode": 0, "gender": 0})
    .then(current_order => res.send(current_order))
    .catch(err => next(err));
});

// router.post('/', (req, res, next) => {
//   Current_Order
//     .create(req.body)
//     .then(current_order => res.status(201).send(current_order))
//     .catch(err => next(err));
// });

router.post('/', async (req, res) => {
  try {
    // const partner = await Partner.findOne({
    //   _id: req.body.partners
    // });
    const storeData = await Store.findOne({
      _id: req.body.store_id
    });
    const addressData = await Customer_Address.findOne({
      customer_id: req.body.customer_id
    });
    const customerData = await Customer.findOne({
      _id: req.body.customer_id
    });
    var product_ids = req.body.items.map(function(item){return mongoose.Types.ObjectId(item.product_id)});
    const productNames = await Product.find({
      '_id': { $in: product_ids }
    });
    var product_names = productNames.map(function(item){return item.name});

    let storeDetail = {
      name: storeData.name,
      location: storeData.address.location
    };

    let shipping = {
      name: customerData.name,
      unit_no: addressData.unit_no,
      street: addressData.street,
      city: addressData.street,
      country: addressData.country,
      postcode: addressData.postcode
    };

    const newOrder = new Current_Order({
      customer_id: req.body.customer_id,
      store_id: storeData.id,
      store: storeDetail,
      // partners: partner.id,
      // partner_id: partner.id,
      //partners: partnerDetail,
      items: req.body.items,
      shipping_address: shipping,
    });

    for (index = 0; index < newOrder.items.length; index++) {
      newOrder.items[index]["name"] = product_names[index];
    };
    newOrder.total_item_price = (newOrder.items.reduce((accum,item) => accum + item.total, 0)).toFixed(2)
    newOrder.is_fresh = await isFresh(newOrder.items[0].product_id)
    newOrder.total_amount = (newOrder.total_item_price + newOrder.delivery_fee).toFixed(2)

    await newOrder.save()
    res.json(newOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message)
  }
});

async function isFresh(p_id)
{
  const result = await Product.aggregate(
    [
      {
          $match: {
              _id: p_id,
          }
      }
  ]
  );
  return result[0].is_fresh
};
