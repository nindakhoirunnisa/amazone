const express = require('express');
const router = express.Router();
const Customer_Address = require('../models/customer_address');

module.exports = router; 

router.get('/', (req, res, next) => {
  Customer_Address
    .aggregate([
      { $limit: 1 }
    ])
    .then(customerAddress => res.send(customerAddress))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Customer_Address
    .create(req.body)
    .then(custAddress => res.status(201).send(custAddress))
    .catch(err => next(err));
});