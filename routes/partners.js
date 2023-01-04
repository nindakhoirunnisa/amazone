const express = require('express');
const router = express.Router();
const Partner = require('../models/partner');

module.exports = router; 

router.get('/', (req, res, next) => {
  Partner
    .aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [
              parseFloat(req.query.lng),  // longitude first
              parseFloat(req.query.lat)   // latitude second
            ]
          },
          distanceField: 'dist.calculated',
          maxDistance: 1000,
          query: {
            is_idle: true
          },
          spherical: true
        }
      },
      {
        '$addFields': {
          'ETA': {
            '$divide': [
              '$dist.calculated', 300
            ]
          }
        }
      },
      { $limit: 1 }
    ])
    .then(nearestPartner => res.send(nearestPartner))
    .catch(err => next(err));
});

router.post('/', (req, res, next) => {
  Partner
    .create(req.body)
    .then(partner => res.status(201).send(partner))
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) => {
  Partner
    .findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(partner => {
      if (!partner)
        return next({
          status: 404,
          message: 'There is no partner with the given ID.'
        });

      res.send(partner);
    })
    .catch(err => next(err));
});

router.delete('/:id', (req, res, next) => {
  Partner
    .findOneAndDelete({_id: req.params.id})
    .then(partner => {
      if (!partner)
        return next({
          status: 404,
          message: 'There is no partner with the given ID.'
        });
  
      res.send(partner);
    })
    .catch(err => next(err));
});