const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product_Catalog = require('../models/product_catalog');
const Store = require('../models/store')

module.exports = router; 

router.get('/fresh', (req, res, next) => {
  try {
    getNearestStore(parseFloat(req.query.lng), parseFloat(req.query.lat), false).then(storeDetails => {
      if (req.query.name == undefined) {
        if (req.query.category == undefined) {
          getProductsFromStore(storeDetails, true).then(productList => res.send(productList))
        } else {
          searchProductCategory(storeDetails, true, req.query.category).then(productList => res.send(productList));
        }
      } else {
        searchProductName(storeDetails, true, req.query.name).then(productList => res.send(productList));
      }
    })
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error while fetching fresh products' });
  }
});

router.get('/other', (req, res, next) => {
  try {
    getNearestStore(parseFloat(req.query.lng), parseFloat(req.query.lat), false).then(storeDetails => {
      if (req.query.name == undefined) {
        if (req.query.category == undefined) {
          getProductsFromStore(storeDetails, false).then(productList => res.send(productList))
        } else {
          searchProductCategory(storeDetails, false, req.query.category).then(productList => res.send(productList));
        }
      } else {
        searchProductName(storeDetails, false, req.query.name).then(productList => res.send(productList));
      }
    })
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error while fetching fresh products' });
  }
});

router.post('/fresh', (req, res, next) => {
  if(req.body.is_fresh == true){
    Product_Catalog
    .create(req.body)
    .then(prdct => res.status(201).send(prdct))
    .catch(err => next(err));
  } else {
    res.send({message: "product should be fresh"})
  }
});

router.post('/other', (req, res, next) => {
  if(req.body.is_fresh == false){
    Product_Catalog
    .create(req.body)
    .then(prdct => res.status(201).send(prdct))
    .catch(err => next(err));
  } else {
    res.send({message: "product should be non-fresh"})
  }
});


router.put('/fresh/:id', async (req, res) => {
  const item = req.body;
  try {
      let picklist = await Product_Catalog.findById(req.params.id);

      if (!picklist)
          return res.status(404).json({ json: 'Product not found' });

      let picklist2 = await Product_Catalog.findOne(
          { _id: req.params.id, "stocks.store_id": req.body.store_id},
      );
      if(!picklist2){
        pl2 = await Product_Catalog.findOneAndUpdate(
          { _id: req.params.id},
          {
              $push: { stocks: item },
          },
          { new: true }
      );
      res.json(pl2);
      } else {
        Product_Catalog.findOneAndUpdate({
          _id: req.params.id, "stocks.store_id": req.body.store_id
        },{
          $inc: {
            "stocks.$.stock": item.stock
          }
        },
        {
          new: true
        }
      ).then(pl3 => res.send(pl3))
      // res.json(pl3)
      }
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

async function getNearestStore(longitude,latitude, isWarehouse)
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
          spherical: true,
          query: {
            is_warehouse: isWarehouse
          }
        }
      },
      { $limit: 1 }
    ]
  );
  return result[0]._id
};

async function getProductsFromStore(storeID, isFresh)
{
  const result = await Product_Catalog.aggregate(
    [
      {
          $unwind: {
              path: '$stocks'
          }
      }, {
          $match: {
              'stocks.store_id': new mongoose.Types.ObjectId(storeID),
              'is_fresh': isFresh,
          }
      }
  ]
  );
  return result
};

async function searchProductCategory(storeID, isFresh, productCategory) {
  const result = await Product_Catalog.aggregate(
    [
      {
        $unwind: {
          path: '$stocks'
        }
      }, {
        $match: {
          'stocks.store_id': new mongoose.Types.ObjectId(storeID),
          'is_fresh': isFresh,
          'category': { $regex: productCategory }

        }
      }
    ]
  );
  return result
}

async function searchProductName(storeID, isFresh, productName) {
  const result = await Product_Catalog.aggregate(
    [
      {
        $unwind: {
          path: '$stocks'
        }
      }, {
        $match: {
          'stocks.store_id': new mongoose.Types.ObjectId(storeID),
          'is_fresh': isFresh,
          'name': { $regex: productName }

        }
      }
    ]
  );
  return result
}