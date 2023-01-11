const storeRevenueSchema = new Schema({
    store_revenue: {
      type: number,
      required: true
    },
    store_name: {
        type: number,
        required: true
      },
      store_is_warehouse: {
        type: Boolean,
        required: true
      },
  _id : true
}
 );

 const Store_Revenue = mongoose.model('Store_Revenue', storeRevenueSchema);

 module.exports = Store_Revenue;