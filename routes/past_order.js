const express = require('express');
const router = express.Router();
const Past_Order = require('../models/past_order');
const mongoose = require('mongoose');

module.exports = router;


// Get past orders for the customer
router.get('/:id', (req, res, next) => {
    try {
        Past_Order.aggregate([
            {
                '$unwind': {
                    'path': '$orders'
                }
            }, {
                '$match': {
                    'orders.customer_id': mongoose.Types.ObjectId(req.params.id)
                }
            }
        ]).then(pastOrder => res.send(pastOrder))
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error occured while getting past orders' });
    }
});