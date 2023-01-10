const { Number } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerRatingSchema = new Schema({
  partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
  },
  //need to change this
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Past_Order.orders',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  }
},
{
  versionKey: false
});

partnerRatingSchema.index({order_id: 1, partner_id: 1}, {name: 'partner_order', unique: true});

const Partner_Rating = mongoose.model('Partner_Rating', partnerRatingSchema);


module.exports = Partner_Rating;
