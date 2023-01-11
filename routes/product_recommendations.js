const express = require('express');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const router = express.Router();
const Product_Recommendation = require('../models/product_recommendation');
const Product = require('../models/product_catalog');
const Store = require('../models/store');
const Customer_Address = require('../models/customer_address');
const { ObjectId } = require('mongodb');

module.exports = router;

router.get('/', async ( req, res, next) => {
  try {
    let cust_info = await Customer_Address.findOne({customer_id: req.body.customer_id})
    getNearestStore(parseFloat(cust_info.location.coordinates[0]), parseFloat(cust_info.location.coordinates[1])).then(store_id => {
      Product_Recommendation.findOne({customer_id: req.body.customer_id,
      'recommendations.store_id': mongoose.Types.ObjectId(store_id)})
      .then(reslt => res.send(reslt))
      .catch(err => next(err))
    })
  } catch {
    res.send("Not found")
  }
});


async function getNearestStore(longitude,latitude)
{
  const result = await Store.aggregate(
    [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [
              parseFloat(longitude),  // longitude first
              parseFloat(latitude)   // latitude second
            ]
          },
          distanceField: 'dist.calculated',
          spherical: true
        }
      },
      { $limit: 1 }
    ]
  );
  return result[0]._id
};