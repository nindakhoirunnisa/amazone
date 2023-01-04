const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

module.exports = router; 

router.get('/', (req, res, next) => {
  Customer
    .aggregate([
      { $limit: 10 }
    ])
    .then(cstmr => res.send(cstmr))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Customer
    .create(req.body)
    .then(partner => res.status(201).send(partner))
    .catch(err => next(err));
});