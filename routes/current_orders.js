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
  // try {
    Current_Order.find().populate('partners', {'is_idle': 0, 'account_number': 0, "sortcode": 0, "gender": 0})
    .then(current_order => res.send(current_order))
    .catch(err => next(err));
  // } catch {
    // Current_Order.find()
    // .then(current_order => res.send(current_order))
    // .catch(err => next(err));
  // }
  
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
    const custLocation = await Customer_Address.findOne({
      customer_id: req.body.customer_id
    });
    var product_ids = req.body.items.map(function(item){return mongoose.Types.ObjectId(item.product_id)});
    const productNames = await Product.find({
      '_id': { $in: product_ids }
    });
    var product_names = productNames.map(function(item){return item.name});
    const productPrices = await Product.find({
      '_id': { $in: product_ids }
    });
    var product_prices = productPrices.map(function(item){return item.selling_price});

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
      postcode: addressData.postcode,
      location: custLocation.location
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
      newOrder.items[index]["name"] = product_names[index]
      newOrder.items[index]['unit_price'] = product_prices[index];
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

router.put('/cart/:id', async (req, res) => {
  const item = req.body;
  const item_array = [req.body];
  var product_ids = item_array.map(function(itm){return mongoose.Types.ObjectId(itm.product_id)});
  const productNames = await Product.find({
    '_id': { $in: product_ids }
  });
  var product_names = productNames.map(function(item){return item.name});
  const productPrices = await Product.find({
    '_id': { $in: product_ids }
  });
  var product_prices = productPrices.map(function(item){return item.selling_price});
  for (index = 0; index < item_array.length; index++) {
    item_array[index]["name"] = product_names[index]
    item_array[index]['unit_price'] = product_prices[index];
  };
  try {
      let picklist = await Current_Order.findById(req.params.id);

      if (!picklist)
          return res.status(404).json({ json: 'Cart not found' });

      let picklist2 = await Current_Order.findOne(
          { _id: req.params.id, "items.product_id": req.body.product_id},
      );
      if(!picklist2){
        pl2 = await Current_Order.findOneAndUpdate(
          { _id: req.params.id},
          {
              $push: { items: item },
              $inc: { total_item_price: (item.quantity * item.unit_price).toFixed(2), 
                total_amount: (item.quantity * item.unit_price).toFixed(2) }
          },
          { new: true }
      );
      res.json(pl2);
      } else {
        Current_Order.findOneAndUpdate({
          _id: req.params.id, "items.product_id": req.body.product_id
        },{
          $inc: {
            "items.$.quantity": item.quantity,
            "items.$.total": (item.quantity * item.unit_price).toFixed(2),
            total_item_price: (item.quantity * item.unit_price).toFixed(2), 
            total_amount: (item.quantity * item.unit_price).toFixed(2)
          }
        },
        {
          new: true
        }
      ).then(pl3 => res.send(pl3))
      // res.json(pl3)
      }
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/checkout/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.findById(req.params.id);
    if (!picklist){
      return res.status(404).json({ json: 'Cart not found' });
    }

    Current_Order.findOneAndUpdate({
      _id: req.params.id
    },{
      $set: {
        order_status: "payment-confirmed",
        is_paid: true
      }
    },
    {
      new: true
    }
  ).then(pl3 => res.json(pl3))
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

router.put('/seller/confirm-order/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.findById(req.params.id);
    if (!picklist){
      return res.status(404).json({ json: 'Order not found' });
    }
    let s_long = picklist.store.location.coordinates[0]
    let s_lat = picklist.store.location.coordinates[1]
    
    getNearestPartner(s_long, s_lat).then(p_id => {
      Current_Order.findOneAndUpdate({
        _id: req.params.id
      }, {
        $set: {
          order_status: 'order-confirmed',
          partners: p_id
        }
      }, {
        new: true
      }).then(pl3 => res.json(pl3))
    })
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

// getNearestStore(parseFloat(req.query.lng), parseFloat(req.query.lat)).then(storeDetails =>
//   {
//     getProductsFromStore(storeDetails).then(productList => res.send(productList));
//   }) ;


async function getNearestPartner(long, lat)
{
  const result = await Partner.aggregate(
    [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [
            parseFloat(long),  // longitude first
            parseFloat(lat)   // latitude second
          ]
        },
        distanceField: 'dist.calculated',
        maxDistance: 1000,
        query: {
          is_idle: true
        },
        spherical: true
      }
    },
    {
      '$addFields': {
        'ETA': {
          '$divide': [
            '$dist.calculated', 250
          ]
        }
      }
    },
    { $limit: 1 }
  ])
  return result[0]._id
};