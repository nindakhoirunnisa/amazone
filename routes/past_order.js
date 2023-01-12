const express = require('express');
const router = express.Router();
const Past_Order = require('../models/past_order');

module.exports = router;


// Get past orders for the customer
router.get('/:id', (req, res, next) => {
    try {
        Past_Order.find({ 'orders.customer_id': req.params.id, }).then(past_order => res.send(past_order))
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Error occured while getting past orders' });
    }
});