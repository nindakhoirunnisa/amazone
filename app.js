const mongoose = require('mongoose');
const express = require('express');
const partnersRouter = require('./routes/partners');
const customersRouter = require('./routes/customers');
const customerAddressesRouter = require('./routes/customer_addresses');
const productCatalogsRouter = require('./routes/fresh_products');
const productDescRouter = require('./routes/product_descriptions');
const storesRouter = require('./routes/stores');
const currentOrdersRouter = require('./routes/current_orders');
const partnerRatingsRouter = require('./routes/partner_ratings');
const inventoryRouter = require('./routes/daily_inventories');
const recommendationRouter = require('./routes/product_recommendations');
const cron = require('node-cron')

mongoose.set('runValidators', true);

const app = express();

const db = 'mongodb+srv://nindakhrnns:Mongodb0510@amazone.7o8cfqw.mongodb.net/?retryWrites=true&w=majority'

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log(`Connected to the Amazone database`))
  .catch((err) => {
    console.error(`Error connecting to ${db}...`);
    process.exit(0);
  });

app.use(express.json());

app.use('/api/partners', partnersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/customer_addresses', customerAddressesRouter);
//app.use('/api/product', productCatalogsRouter);
app.use('/api/products', productCatalogsRouter);
app.use('/api/product/description', productDescRouter);
app.use('/api/stores', storesRouter);
app.use('/api/order/current_orders', currentOrdersRouter);
app.use('/api/partners/rating', partnerRatingsRouter);
app.use('/api/daily-inventories', inventoryRouter)
app.use('/api/product-recommendations', recommendationRouter)

app.use((req, res, next) => {
  const err = new Error(`Route could not be found: ${req.url}`);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .send({ error: err.message || 'Something went wrong...' });
});

cron.schedule("0 59 23 * * *", function () {
  fetch("http://localhost:3000/api/daily-inventories", {
    method: 'POST', 
    headers: {
      'Accept': '*/*'
    },
    referrerPolicy: 'no-referrer'
  }).then(response => response.json())
  .then(json => console.log(json))
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}...`));