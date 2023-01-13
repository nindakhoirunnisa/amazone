const express = require('express');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const router = express.Router();
const PastOrders = require('../models/past_order')

const { ObjectId } = require('mongodb');

module.exports = router;

router.get('/', async (req, res, next) => {
  let GPMandCOGS = await getGPMandCOGS(req.body.startDate, req.body.endDate);
  res.status(200).send(GPMandCOGS);
});

router.get('/store', async (req, res, next) => {
  let StoreRevenue = await getStoreRevenue(req.body.startDate, req.body.endDate);
  res.status(200).send(StoreRevenue);
});

router.get('/product', async (req, res, next) => {
  let ProductCategoryRevenue = await getProductCategory(req.body.startDate, req.body.endDate);
  res.status(200).send(ProductCategoryRevenue);
});

async function getGPMandCOGS(startDate, endDate) {
  const result = await PastOrders.aggregate(
    [
      {
        '$unwind': {
          'path': '$orders'
        }
      }, {
        '$match': {
          'orders.created_at': {
            '$gte': new Date(startDate)
          },
          'orders.created_at': {
            '$lte': new Date(endDate)
          }
        }
      }, {
        '$unwind': {
          'path': '$orders.items'
        }
      }, {
        '$lookup': {
          'from': 'product_catalogs', 
          'localField': 'orders.items.product_id', 
          'foreignField': '_id', 
          'as': 'product_details'
        }
      }, {
        '$unwind': {
          'path': '$product_details'
        }
      }, {
        '$addFields': {
          'cost_price': '$product_details.cost_price', 
          'unit_price': '$orders.items.unit_price', 
          'store_id': '$orders.store_id', 
          'item_name': '$orders.items.name'
        }
      }, {
        '$lookup': {
          'from': 'stores', 
          'localField': 'orders.store_id', 
          'foreignField': '_id', 
          'as': 'storeDetails'
        }
      }, {
        '$project': {
          'cost_price': 1, 
          'unit_price': 1, 
          'item_name': 1, 
          'store_id': 1
        }
      }, {
        '$group': {
          '_id': null, 
          'COGS': {
            '$sum': '$cost_price'
          }, 
          'revenue': {
            '$sum': '$unit_price'
          }
        }
      }, {
        '$project': {
          'COGS': 1, 
          'revenue': 1, 
          'GPM': {
            '$subtract': [
              '$revenue', '$COGS'
            ]
          }
        }
      }
    ]
  )
  return result;
}
async function getStoreRevenue(startDate, endDate) {
  const result = await PastOrders.aggregate(
    [
      {
        '$unwind': {
          'path': '$orders'
        }
      },{
        '$match': {
          'orders.created_at': {
            '$gte': new Date(startDate)
          },
          'orders.created_at': {
            '$lte': new Date(endDate)
          }
        }
      },  
       {
        '$group': {
          '_id': '$orders.store_id',
          'store_revenue': {
            '$sum': '$orders.total_amount'
          }
        }
      }, {
        '$lookup': {
          'from': 'stores',
          'localField': '_id',
          'foreignField': '_id',
          'as': 'stores'
        }
      }, {
        '$unwind': {
          'path': '$stores'
        }
      }, {
        '$project': {
          'store_revenue': 1,
          'store_name': '$stores.name',
          'store_is_warehouse': '$stores.is_warehouse'
        }
      }
    ]
  )
  return result;
}

async function getProductCategory(startDate, endDate) {
  const result = await PastOrders.aggregate(
    [
      {
        '$unwind': {
          'path': '$orders'
        }
      }, {
        '$match': {
          'orders.created_at': {
            '$gte': new Date(startDate)
          },
          'orders.created_at': {
            '$lte': new Date(endDate)
          }
        }
      },
      {
        '$unwind': {
          'path': '$orders.items'
        }
      }, {
        '$lookup': {
          'from': 'product_catalogs',
          'localField': 'orders.items.product_id',
          'foreignField': '_id',
          'as': 'product_details'
        }
      }, {
        '$unwind': {
          'path': '$product_details'
        }
      }, {
        '$group': {
          '_id': '$product_details.category',
          'product_category_revenue': {
            '$sum': '$orders.items.unit_price'
          }
        }
      }
    ]
  )
  return result

}

