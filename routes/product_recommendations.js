const express = require('express');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const router = express.Router();
const Product_Recommendation = require('../models/product_recommendation');
const { ObjectId } = require('mongodb');

module.exports = router;

router.get('/', async ( req, res) => {
  Product_Recommendation.findOne({customer_id: req.body.customer_id}).then(reslt => res.send(reslt.recommendations))
});