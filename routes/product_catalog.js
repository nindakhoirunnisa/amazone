const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product_Catalog = require('../models/product_catalog');
const Customer_Address = require('../models/customer_address');
const Store = require('../models/store')

module.exports = router;

router.get('/fresh/:id', (req, res, next) => {
  try {
    getCustomerLocation(req.params.id, req.query.addr).then(coordinates => {
      getNearestStore(parseFloat(coordinates[0]), parseFloat(coordinates[1]), false).then(storeDetails => {
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
    })
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error while searching fresh products' });
  }
});

router.get('/other/:id', (req, res, next) => {
  try {
    getCustomerLocation(req.params.id, req.query.addr).then(coordinates => {
      getNearestStore(parseFloat(coordinates[0]), parseFloat(coordinates[1]), true).then(storeDetails => {
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
    })
  }
  catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error while searching other products' });
  }
});

router.post('/', (req, res, next) => {
  Product_Catalog
    .create(req.body)
    .then(prdct => res.status(201).send(prdct))
    .catch(err => next(err));
});


router.put('/fresh/:id', async (req, res) => {
  const item = req.body;
  try {
    let picklist = await Product_Catalog.findById(req.params.id);

    if (!picklist)
      return res.status(404).json({ json: 'Product not found' });

    let picklist2 = await Product_Catalog.findOne(
      { _id: req.params.id, "stocks.store_id": req.body.store_id },
    );
    if (!picklist2) {
      pl2 = await Product_Catalog.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: { stocks: item },
        },
        { new: true }
      );
      res.json(pl2);
    } else {
      Product_Catalog.findOneAndUpdate({
        _id: req.params.id, "stocks.store_id": req.body.store_id
      }, {
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

async function getCustomerLocation(customerId, addressId) {
  if (addressId == undefined) {
    return getDefaultAddress(customerId)
  }
  else {
    const coordinates = await Customer_Address.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(addressId),
          customer_id: mongoose.Types.ObjectId(customerId),
        }
      },
      {
        $project: {
          '_id': 0,
          'location.coordinates': 1
        }
      }
    ]
    );
    return coordinates[0].location.coordinates
  }
}

async function getDefaultAddress(customerId) {
  const addrId = await Customer_Address.findOne({
    customer_id: customerId,
    type: 'Shipping'
  });
  return addrId.location.coordinates
}

async function getNearestStore(longitude, latitude, isWarehouse) {
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

async function getProductsFromStore(storeID, isFresh) {
  const result = await Product_Catalog.aggregate(
    [
      {
        $unwind: {
          path: '$stocks'
        }
      }, {
        $match: {
          'stocks.store_id': new mongoose.Types.ObjectId(storeID),
          'stocks.stock': {$gte: 1},
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
          'stocks.stock': {$gte: 1},
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
          'stocks.stock': {$gte: 1},
          'is_fresh': isFresh,
          'name': { $regex: productName }

        }
      }
    ]
  );
  return result
}