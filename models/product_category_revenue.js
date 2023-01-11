const { Number, now } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCategoryRevenueSchema = new Schema({
    product_category_revenue: {
      type: number,
      required: true
    },
      _id : true
  }
  );
  
const Product_Category_Revenue = mongoose.model('Product_Category_Revenue', productCategoryRevenueSchema);
  

module.exports = Product_Category_Revenue;