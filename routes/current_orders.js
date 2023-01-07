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
  Current_Order.findOne().populate('partners', {'is_idle': 0, 'account_number': 0, "sortcode": 0, "gender": 0})
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
    const partner = await Partner.findOne({
      _id: req.body.partners
    });
    const storeData = await Store.findOne({
      _id: req.body.store_id
    });
    const addressData = await Customer_Address.findOne({
      customer_id: req.body.customer_id
    });
    const customerData = await Customer.findOne({
      _id: req.body.customer_id
    });

    // const itemsData = {}
    // product_ids.forEach((product_id, index) => {
    //   itemsData[index] = product_id
    // })
    // console.log(itemsData)

    let storeDetail = {
      name: storeData.name,
      location: storeData.address.location
    };

    // let partnerDetail = {
    //   name: partner.name,
    //   location: partner.location
    // };

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
      partners: partner.id,
      // partner_id: partner.id,
      //partners: partnerDetail,
      items: req.body.items,
      shipping_address: shipping
    });

    await newOrder.save()
    res.json(newOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error')
  }
});