const express = require('express');
const router = express.Router();
const Product_Catalog = require('../models/product_catalog');

module.exports = router; 

router.get('/', (req, res, next) => {
  Product_Catalog
    .aggregate([
      { $limit: 20 }
    ])
    .then(prdct => res.send(prdct))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Product_Catalog
    .create(req.body)
    .then(prdct => res.status(201).send(prdct))
    .catch(err => next(err));
});