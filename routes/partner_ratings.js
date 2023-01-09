const express = require('express');
const router = express.Router();
const Partner_Rating = require('../models/partner_rating');

module.exports = router; 

router.post('/', (req, res, next) => {
  Partner_Rating
    .create(req.body)
    .then(partner_rating => res.status(201).send(partner_rating))
    .catch(err => next(err));
});