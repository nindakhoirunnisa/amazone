const express = require('express');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const router = express.Router();
const PastOrders = require('../models/past_order')
//const StoreRevenue = require('../models/store_revenue')
//const ProductCategoryRevenue = require('../models/product_category_revenue')
//const COGSGPM = require('../models/COGS_GPM')

const { ObjectId } = require('mongodb');

module.exports = router;

router.get('/', async ( req, res, next) => {
  GPMandCOGS = await getGPMandCOGS(req.body.startDate,req.body.endDate);
  StoreRevenue = await getStoreRevenue(req.body.startDate,req.body.endDate);
  ProductCategoryRevenue = await getProductCategory(req.body.startDate,req.body.endDate);
  //res.status(200).send()
});

async function getGPMandCOGS(startDate,endDate){
    const result = await PastOrders.aggregate(
        [
            {
              '$match': {
                'end_date': {
                  '$gte': startDate
                },
                'end_date': {
                    '$lte': endDate
                  }
              }
            }, {
              '$unwind': {
                'path': '$orders'
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
async function getStoreRevenue(startDate,endDate)
{
    const result = await PastOrders.aggregate(
        [
            {
                '$match': {
                    'end_date': {
                        '$gte': startDate
                    },
                    'end_date': {
                        '$lte': endDate
                    }
                }
            }, {
                '$unwind': {
                    'path': '$orders'
                }
            }, {
                '$match': {
                    'start_date': '2023-01-08T00:00:00.000+00:00'
                }
            }, {
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

async function getProductCategory(startDate, endDate)
{
    const result = await PastOrders.aggregate(
        [
            {
              '$match': {
                'end_date': {
                  '$gte': startDate
                },
                'end_date':{
                    '$lte':endDate
                },
              }
            }, {
              '$unwind': {
                'path': '$orders'
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

