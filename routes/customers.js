const express = require('express');
const router = express.Router();
const Customer = require('../models/customer');

module.exports = router; 

router.get('/', (req, res, next) => {
  const size = parseInt(req.query.size)
  let page = parseInt(req.query.page) >= 1 ? parseInt(req.query.page) : 1;

  page = page - 1

  Customer.find({}).limit(size).skip(size*page).exec().then(customers => {
    res.json({customers, page: page+1, size: size})
  })
});

router.post('/', (req, res, next) => {
  Customer
    .create(req.body)
    .then(partner => res.status(201).send(partner))
    .catch(err => next(err));
});