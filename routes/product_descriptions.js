const express = require('express');
const router = express.Router();
const Product_Description = require('../models/product_description');

module.exports = router; 

router.get('/', (req, res, next) => {
  Product_Description
    .aggregate([
      { $limit: 20 }
    ])
    .then(prdctCtlg => res.send(prdctCtlg))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Product_Description
    .create(req.body)
    .then(prdctCtlg => res.status(201).send(prdctCtlg))
    .catch(err => next(err));
});