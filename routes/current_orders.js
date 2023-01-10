const express = require('express');
const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const router = express.Router();
const Current_Order = require('../models/current_order');
const Partner = require('../models/partner');
const Store = require('../models/store');
const Customer_Address = require('../models/customer_address');
const Customer = require('../models/customer');
const Product = require('../models/product_catalog');
const Past_Order = require('../models/past_order');
const Product_Recommendation = require('../models/product_recommendation');
const { ObjectId } = require('mongodb');

module.exports = router;

router.get('/', (req, res, next) => {
  // try {
    Current_Order.find().populate('partners', {'is_idle': 0, 'account_number': 0, "sortcode": 0, "gender": 0})
    .then(current_order => res.send(current_order))
    .catch(err => next(err));
  // } catch {
    // Current_Order.find()
    // .then(current_order => res.send(current_order))
    // .catch(err => next(err));
  // }
  
});

// router.post('/', (req, res, next) => {
//   Current_Order
//     .create(req.body)
//     .then(current_order => res.status(201).send(current_order))
//     .catch(err => next(err));
// });

// ADD TO CART
router.post('/', async (req, res) => {
  try {
    // const partner = await Partner.findOne({
    //   _id: req.body.partners
    // });
    const storeData = await Store.findOne({
      _id: req.body.store_id
    });
    const addressData = await Customer_Address.findOne({
      customer_id: req.body.customer_id
    });
    const customerData = await Customer.findOne({
      _id: req.body.customer_id
    });
    const custLocation = await Customer_Address.findOne({
      customer_id: req.body.customer_id
    });
    var product_ids = req.body.items.map(function(item){return mongoose.Types.ObjectId(item.product_id)});
    const productNames = await Product.find({
      '_id': { $in: product_ids }
    });
    var product_names = productNames.map(function(item){return item.name});
    const productPrices = await Product.find({
      '_id': { $in: product_ids }
    });
    var product_prices = productPrices.map(function(item){return item.selling_price});
    var product_qtys = req.body.items.map(function(item){return item.quantity});

    let storeDetail = {
      name: storeData.name,
      location: storeData.address.location
    };

    let shipping = {
      name: customerData.name,
      unit_no: addressData.unit_no,
      street: addressData.street,
      city: addressData.street,
      country: addressData.country,
      postcode: addressData.postcode,
      location: custLocation.location
    };

    const newOrder = new Current_Order({
      customer_id: req.body.customer_id,
      store_id: storeData.id,
      store: storeDetail,
      // partners: partner.id,
      // partner_id: partner.id,
      //partners: partnerDetail,
      items: req.body.items,
      shipping_address: shipping,
    });

    for (index = 0; index < newOrder.items.length; index++) {
      newOrder.items[index]["name"] = product_names[index]
      newOrder.items[index]['unit_price'] = product_prices[index];
      newOrder.items[index]['total'] = product_prices[index] * product_qtys[index]
    };
    newOrder.total_item_price = (newOrder.items.reduce((accum,item) => accum + item.total, 0)).toFixed(2)
    newOrder.is_fresh = await isFresh(newOrder.items[0].product_id)
    newOrder.total_amount = (newOrder.total_item_price + newOrder.delivery_fee).toFixed(2)

    await newOrder.save()
    res.json(newOrder);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message)
  }
});

async function isFresh(p_id)
{
  const result = await Product.aggregate(
    [
      {
          $match: {
              _id: p_id,
          }
      }
  ]
  );
  return result[0].is_fresh
};

// UPDATE QUANTITY/PRODUCT
router.put('/cart/:id', async (req, res) => {
  const item = req.body;
  const item_array = [req.body];
  var product_ids = item_array.map(function(itm){return mongoose.Types.ObjectId(itm.product_id)});
  const productNames = await Product.find({
    '_id': { $in: product_ids }
  });
  var product_names = productNames.map(function(item){return item.name});
  const productPrices = await Product.find({
    '_id': { $in: product_ids }
  });
  var product_prices = productPrices.map(function(item){return item.selling_price});
  for (index = 0; index < item_array.length; index++) {
    item_array[index]["name"] = product_names[index]
    item_array[index]['unit_price'] = product_prices[index];
  };
  try {
      let picklist = await Current_Order.findById(req.params.id);

      if (!picklist)
          return res.status(404).json({ json: 'Cart not found' });

      let picklist2 = await Current_Order.findOne(
          { _id: req.params.id, "items.product_id": req.body.product_id},
      );
      if(!picklist2){
        pl2 = await Current_Order.findOneAndUpdate(
          { _id: req.params.id},
          {
              $push: { items: item },
              $inc: { total_item_price: (item.quantity * item.unit_price).toFixed(2), 
                total_amount: (item.quantity * item.unit_price).toFixed(2) }
          },
          { new: true }
      );
      res.json(pl2);
      } else {
        Current_Order.findOneAndUpdate({
          _id: req.params.id, "items.product_id": req.body.product_id
        },{
          $inc: {
            "items.$.quantity": item.quantity,
            "items.$.total": (item.quantity * item.unit_price).toFixed(2),
            total_item_price: (item.quantity * item.unit_price).toFixed(2), 
            total_amount: (item.quantity * item.unit_price).toFixed(2)
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

// CHECKOUT --> is_paid: true
router.put('/checkout/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.aggregate([{
      $match: {
        _id: mongoose.Types.ObjectId(req.params.id)
      }
    }]);

    if (!picklist){
      return res.status(404).json({ json: 'Cart not found' });
    }

    var product_ids = picklist[0].items.map(function(itm){return mongoose.Types.ObjectId(itm.product_id)});
    var store_ids = picklist[0].items.map(function(itm){return mongoose.Types.ObjectId(itm.store_id)});    
    var product_qtys = picklist[0].items.map(function(itm){return itm.quantity});

    let history = {
      name: "payment-confirmed",
      created_at: Date.now()
    }
    stockValidator(product_qtys, product_ids, store_ids).then(result => {
      if(!result){
        res.json({message: "stock < quantity"})
      } else {
        Current_Order.findOneAndUpdate({
          _id: req.params.id
        },{
          $set: {
            order_status: "payment-confirmed",
            is_paid: true,
            order_status_histories: [history]
          }
        },
        {
          new: true
        }
      ).then(rslt => console.log("Updated"));

      for (i = 0; i < product_ids.length; i++){
        var results = []
        Product.findOneAndUpdate({
          _id: product_ids[i], "stocks.store_id": store_ids[i]
        }, {
          $inc: {
            "stocks.$.stock": -product_qtys[i]
          }
        },{
          new: true
        }).then(rslt => results.push(rslt))
      }
      res.json({message: "Payment confirmed"})
      }
    })
    async function getStock(p_id, s_id) {
      const result = await Product.aggregate([
        {
          $match: {
            _id: p_id,
          }
        },
        {
          $unwind: {
            path: '$stocks'
          }
        },
        {
          $match: {
            "stocks.store_id": s_id
          } 
        }
      ]);
      return result[0].stocks.stock
    };

    async function stockValidator(value, pid, sid) {
      var stocks = []
      var status = []
      for(i = 0; i < value.length; i++) {
        stocks.push(await getStock(pid[i], sid[i]))
        status.push(value[i] <= stocks[i])
      }
      let checker = arr => arr.every(v => v == true)
      return checker(status)
    };
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

// CONFIRM ORDER, ASSIGN PARTNER
router.put('/seller/confirm-order/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.findById(req.params.id);
    if (!picklist){
      return res.status(404).json({ json: 'Order not found' });
    }
    let s_long = picklist.store.location.coordinates[0]
    let s_lat = picklist.store.location.coordinates[1]
    let orderHistory = {
      name: "order-confirmed",
      created_at: Date.now()
    };
    let deliveryHistory = {
      name: "created",
      created_at: Date.now()
    }
    getNearestPartner(s_long, s_lat).then(p_id => {
      Current_Order.findOneAndUpdate({
        _id: req.params.id
      }, {
        $set: {
          order_status: 'order-confirmed',
          partners: p_id
        },
        $push: {
          order_status_histories: orderHistory,
          'deliveries.order_delivery_status_histories': deliveryHistory
        }
      }, {
        new: true
      }).then(pl3 => res.json(pl3))

      Partner.findOneAndUpdate({
        _id: p_id
      }, {
        $set: {
          is_idle: false
        }
      }).then(rslt => console.log("updated"))
    })
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

async function getNearestPartner(long, lat)
{
  const result = await Partner.aggregate(
    [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [
            parseFloat(long),  // longitude first
            parseFloat(lat)   // latitude second
          ]
        },
        distanceField: 'dist.calculated',
        maxDistance: 2000,
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
            '$dist.calculated', 250
          ]
        }
      }
    },
    { $limit: 1 }
  ])
  return result[0]._id
};

// PICKCED UP
router.put('/partner/pick-up-order/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.findById(req.params.id);
    if (!picklist){
      return res.status(404).json({ json: 'Order not found' });
    }
    let orderHistory = {
      name: "on-delivery",
      created_at: Date.now()
    };
    let deliveryHistory = {
      name: "picked-up",
      created_at: Date.now()
    }
    
    Current_Order.findOneAndUpdate({
      _id: req.params.id
    }, {
      $set: {
        order_status: 'on-delivery',
      },
      $push: {
        order_status_histories: orderHistory,
        'deliveries.order_delivery_status_histories': deliveryHistory
      }
    }, {
      new: true
    }).then(pl3 => res.json(pl3))
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

// ON-DELIVERY
router.put('/partner/on-delivery/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.findById(req.params.id).populate('partners', {'is_idle': 0, 'account_number': 0, "sortcode": 0, "gender": 0});
    if (!picklist){
      return res.status(404).json({ json: 'Order not found' });
    }
    let deliveryHistory = {
      name: "on-delivery",
      created_at: Date.now()
    }

    var long = picklist.shipping_address.location.coordinates[0]
    var lat = picklist.shipping_address.location.coordinates[1]
    var pid = picklist.partners._id

    getETA(long, lat, pid).then(partnerData => {
      Current_Order.findOneAndUpdate({
        _id: req.params.id
      }, {
        $push: {
          'deliveries.order_delivery_status_histories': deliveryHistory
        }
        // $set: {
        //   'deliveries.distance': partnerData.distance,
        //   'deliveries.ETA': partnerData.ETA
        // }
      }, {
        new: true
      }).then(pl3 => res.json(pl3))
    })
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

// TRACK-ORDER
router.put('/track-order/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.findById(req.params.id).populate('partners', {'is_idle': 0, 'account_number': 0, "sortcode": 0, "gender": 0});
    if (!picklist){
      return res.status(404).json({ json: 'Order not found' });
    }

    var long = picklist.shipping_address.location.coordinates[0]
    var lat = picklist.shipping_address.location.coordinates[1]
    var pid = picklist.partners._id

    getETA(long, lat, pid).then(partnerData => {
      Current_Order.findOneAndUpdate({
        _id: req.params.id
      }, {
        $set: {
          'deliveries.distance': partnerData.distance,
          'deliveries.ETA': partnerData.ETA
        }
      }, {
        new: true
      }).then(pl3 => res.json(pl3))
    })
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

// ORDER DELIVERED
router.put('/partner/order-delivered/:id', async (req,res) => {
  try {
    let picklist = await Current_Order.findById(req.params.id);
    if (!picklist){
      return res.status(404).json({ json: 'Order not found' });
    }

    let orderHistory = {
            name: "order-delivered",
            created_at: Date.now()
          };
    let deliveryHistory = {
            name: "order-delivered",
            created_at: Date.now()
          }
          
    Current_Order.findOneAndUpdate({
      _id: req.params.id
    }, {
      $set: {
        order_status: 'order-delivered',
      },
      $push: {
      order_status_histories: orderHistory,
      'deliveries.order_delivery_status_histories': deliveryHistory
      }
    }, {
      new: true
    }).then(result => {
      Current_Order.aggregate([{
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id)
        }
      },{
        $lookup: {
          from: 'partners',
          localField: 'partners',
          foreignField: '_id',
          as: 'partners'
        }
      }, {
        $unwind: {
          path: '$partners'
        }
      },{
        $project: {
          'partners.account_number': 0,
          'partners.sortcode': 0,
          'partners.gender': 0,
          'items.total': 0,
          'items.store_id': 0,
          deliveries: 0,
          'store.location': 0,
        }
      }]).then(result => {
        Past_Order.updateOne({$and: [
          {"start_date" : {$gte: x}}, 
          {"start_date": {$lt: y}}]
        }, {
          $set: {
            start_date: x,
            end_date: z
          },
          $push: {
            orders: result[0]
          }
        },
        {
          upsert: true
        }
        ).then(res1 => {
          let customer_id = picklist.customer_id
          Past_Order.aggregate([
            {
              '$match': {
                'orders.customer_id': mongoose.Types.ObjectId(customer_id)
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
              '$project': {
                'ordered_product': '$orders.items.product_id'
              }
            }, {
              '$group': {
                '_id': 0, 
                'ordered': {
                  '$addToSet': '$ordered_product'
                }
              }
            }, {
              '$project': {
                '_id': 0
              }
            }, {
              '$lookup': {
                'from': 'product_catalogs', 
                'let': {
                  'ordered': '$ordered'
                }, 
                'pipeline': [
                  {
                    '$match': {
                      '$expr': {
                        '$not': {
                          '$in': [
                            '$_id', '$$ordered'
                          ]
                        }
                      }
                    }
                  }
                ], 
                'as': 'recommend'
              }
            }, {
              '$project': {
                'ordered': 0
              }
            }, {
              '$unwind': {
                'path': '$recommend'
              }
            }, {
              '$sort': {
                'recommend.cost_price': -1
              }
            }, {
              '$unwind': {
                'path': '$recommend.stocks'
              }
            }, {
              '$project': {
                '_id': '$recommend._id', 
                'category': '$recommend.category', 
                'name': '$recommend.name', 
                'selling_price': '$recommend.selling_price', 
                'store_id': '$recommend.stocks.store_id', 
                'stock': '$recommend.stocks.stock', 
                'rating': '$recomment.average_rating'
              }
            }, {
              '$lookup': {
                'from': 'stores', 
                'localField': 'store_id', 
                'foreignField': '_id', 
                'as': 'result'
              }
            }, {
              '$unwind': {
                'path': '$result'
              }
            }, {
              '$project': {
                '_id': 1, 
                'category': 1, 
                'name': 1, 
                'selling_price': 1, 
                'stock': 1, 
                'store_name': '$result.name', 
                'rating': 1
              }
            }, {
              '$limit': 10
            }
          ]).then(res2 => {
            let cust_id = picklist.customer_id
            let input = res2;
            Product_Recommendation.updateOne({
              customer_id: customer_id
            }, {
              $set: {
                customer_id: cust_id,
                recommendations: input
              }
            }, {
              upsert: true
            })
            .then(res3 => console.log('recc updated'))
          })
        });
    
        Current_Order.findOneAndDelete({
          _id: req.params.id
        }, function (err, docs) {
          if(err){
            res.send(err)
          } else {
            res.send(docs)
          }
        }).then(pl3 => console.log('deleted from current order'));
      })
    });

    Partner.findOneAndUpdate({
      _id: picklist.partners
    },
    {
      $set: {
        is_idle: true
      }
    },
    {
      new: true
    }).then(console.log("done updating partner's idle status"));
    
    let x = new Date(getDate(picklist.created_at))
    let y = new Date(getNextDate(picklist.created_at))
    let z = new Date(getTwentyThree(new Date(getDate(picklist.created_at))))
    // let customer_id = picklist.customer_id
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
  }
});

function getDate(dateTime){
	return `${dateTime.getFullYear()}-${dateTime.getMonth() + 1}-${dateTime.getDate()}`
}

function getNextDate(dateTime){
	return `${dateTime.getFullYear() }-${dateTime.getMonth() + 1}-${dateTime.getDate() + 1}`
}

function getTwentyThree(dateTime){
  return dateTime.setUTCHours(23,59,59,999)
}

//ORDER DETAIL
router.get('/:id', async (req,res) => {
  let result = await Current_Order.aggregate([{
    $match: {
      _id: mongoose.Types.ObjectId(req.params.id)
    }
  },{
    $lookup: {
      from: 'partners',
      localField: 'partners',
      foreignField: '_id',
      as: 'partners'
    }
  }, {
    $unwind: {
      path: '$partners'
    }
  },{
    $project: {
      'partners.account_number': 0,
      'partners.sortcode': 0,
      'partners.gender': 0,
      'items.total': 0,
      'items.store_id': 0
    }
  }])
  res.send(result[0])
});

async function getETA(long, lat, partner)
{
  const result = await Partner.aggregate(
    [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [
            parseFloat(long),  // longitude first
            parseFloat(lat)   // latitude second
          ]
        },
        distanceField: 'dist.calculated',
        spherical: true,
        query: {
          _id: partner
        }
      }
    },

    {
      $project: {
        _id: 0,
        'distance': '$dist.calculated'
      }
    },
    {
      '$addFields': {
        'ETA': {
          '$divide': [
            '$distance', 250
          ]
        }
      }
    }
  ])
  return result[0]
};

// PRODUCT RATING
router.put('/product-rating/:id', async (req, res) => {
  var data = req.body
  data.forEach(async function (item){
    Past_Order.updateMany({'orders._id': req.params.id}, {
      $set: {'orders.$[o].items.$[p].rating': item.rating},
    }, {
      new: true,
      arrayFilters: [{'o._id': {'$eq': req.params.id}}, 
      {'p.product_id': {'$eq': item.product_id}}]
    }).then();

    Product.findOneAndUpdate({
      _id: item.product_id
    },
    {
      $inc: {
        number_of_ratings: 1,
        total_ratings: item.rating
      }
    }, {
      new: true,
    }).then(result => {
      Product.findOne({_id: item.product_id})
      .then()
    });

    // let picklist = await Product.findOne({_id: item.product_id});
    // Product.findOneAndUpdate({
    //   _id: item.product_id
    // },
    // {
    //   $set: {
    //     average_rating: (picklist.total_ratings/picklist.number_of_ratings).toFixed(2)
    //   }
    // }).then();
  })
  res.status(200).json({ message: 'ok' })
})