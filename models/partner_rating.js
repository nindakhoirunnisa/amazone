const { Number } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partnerRatingSchema = new Schema({
  partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    unique: true
  },
  //need to change this
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Past_Order.orders',
    unique: true
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

const Partner_Rating = mongoose.model('Partner_Rating', partnerRatingSchema);

module.exports = Partner_Rating;
