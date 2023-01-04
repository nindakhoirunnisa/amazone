const express = require('express');
const router = express.Router();
const Stores = require('../models/store');

module.exports = router; 

router.get('/', (req, res, next) => {
  Stores
    .aggregate([
      { $limit: 20 }
    ])
    .then(strs => res.send(strs))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Stores
    .create(req.body)
    .then(strs => res.status(201).send(strs))
    .catch(err => next(err));
});