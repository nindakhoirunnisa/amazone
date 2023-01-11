const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const COGSandGPMSchema = new Schema({
  COGS: {
    type: Number,
    min: 0
  },
  GPM: {
    type: Number,
    min: 0
  },
  _id: false
}
)



const COGS_GPM = mongoose.model('COGS_GPM', COGSandGPMSchema);

module.exports = Store_Revenue;
module.exports = Product_Category_Revenue;
module.exports = COGS_GPM;