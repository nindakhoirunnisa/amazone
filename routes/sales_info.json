const express = require('express');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const router = express.Router();
const Daily_Inventory = require('../models/daily_inventory');
const Product = require('../models/product_catalog');
const { ObjectId } = require('mongodb');

module.exports = router;

router.post('/', async ( req, res, next) => {
  Product.aggregate(pipeline).then(result => {
    let x = new Date(getDate(new Date()))
    let y = new Date(getTwentyThree(new Date(getDate(new Date()))))
    let input = {
      start_date: x,
      end_date: y,
      inventory: result
    };
    Daily_Inventory
      .insertMany(input)
      .then(rslt => res.status(200).send(rslt))
      .catch(err => next(err));
  })
});

pipeline =[
  {
    '$unwind': {
      'path': '$stocks'
    }
  }, {
    '$project': {
      '_id': 0, 
      'product_id': '$_id', 
      'store_id': '$stocks.store_id', 
      'is_fresh': 1, 
      'quantity': '$stocks.stock'
    }
  }, {
    '$lookup': {
      'from': 'stores', 
      'localField': 'store_id', 
      'foreignField': '_id', 
      'as': 'store_details'
    }
  }, {
    '$unwind': {
      'path': '$store_details'
    }
  }, {
    '$project': {
      'product_id': 1, 
      'store_id': 1, 
      'is_fresh': 1, 
      'quantity': 1, 
      'store_name': '$store_details.name'
    }
  }
]

function getDate(dateTime){
return `${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()}`
}

function getTwentyThree(dateTime){
return dateTime.setUTCHours(23,59,59,999)
}