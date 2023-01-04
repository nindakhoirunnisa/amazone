const express = require('express');
const router = express.Router();
const Product_Catalog = require('../models/product_catalog');

module.exports = router; 

router.get('/', (req, res, next) => {
  Product_Catalog
    .aggregate([
      { $limit: 20 }
    ])
    .then(prdct => res.send(prdct))
    .catch(err => next(err));
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