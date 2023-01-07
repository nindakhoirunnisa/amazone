const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product_Catalog = require('../models/product_catalog');
const Store = require('../models/store')

module.exports = router; 

router.get('/', (req, res, next) => {
  
  getNearestStore(parseFloat(req.query.lng), parseFloat(req.query.lat)).then(storeDetails =>
    {
      getProductsFromStore(storeDetails).then(productList => res.send(productList));
    }) ;
  
});

router.post('/', (req, res, next) => {
  Product_Catalog
    .create(req.body)
    .then(prdct => res.status(201).send(prdct))
    .catch(err => next(err));
});


router.put('/:id', async (req, res) => {
  const item = req.body;
  try {
      let picklist = await Product_Catalog.findById(req.params.id);

      if (!picklist)
          return res.status(404).json({ json: 'Product not found' });

      picklist = await Product_Catalog.findOneAndUpdate(
          { _id: req.params.id},
          {
              $push: { stocks: item },
          },
          { new: true }
      );

      res.json(picklist);
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

async function getNearestStore(longitude,latitude)
{
  const result = await Store.aggregate(
    [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [
              parseFloat(longitude),  // longitude first
              parseFloat(latitude)   // latitude second
            ]
          },
          distanceField: 'dist.calculated',
          spherical: true
        }
      },
      { $limit: 1 }
    ]
  );
  return result[0]._id
};

async function getProductsFromStore(storeID)
{
  const result = await Product_Catalog.aggregate(
    [
      {
          $unwind: {
              path: '$stocks'
          }
      }, {
          $match: {
              'stocks.store_id': new mongoose.Types.ObjectId(storeID)
          }
      }
  ]
  );
  return result
};