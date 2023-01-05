const express = require('express');
const router = express.Router();
const Current_Order = require('../models/current_order');

module.exports = router;

router.get('/', (req, res, next) => {
  Current_Order
    .aggregate([
      { $limit: 20 }
    ])
    .then(current_order => res.send(current_order))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Current_Order
    .create(req.body)
    .then(current_order => res.status(201).send(current_order))
    .catch(err => next(err));
});