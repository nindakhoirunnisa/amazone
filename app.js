const mongoose = require('mongoose');
const express = require('express');
const partnersRouter = require('./routes/partners');
const customersRouter = require('./routes/customers');
const customerAddressesRouter = require('./routes/customer_addresses');
const productCatalogsRouter = require('./routes/product_catalogs');
const productDescRouter = require('./routes/product_descriptions');

const app = express();

const db = 'mongodb+srv://nindakhrnns:Mongodb0510@amazone.7o8cfqw.mongodb.net/?retryWrites=true&w=majority'

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log(`Connected to ${db}...`))
  .catch((err) => {
    console.error(`Error connecting to ${db}...`);
    process.exit(0);
  });

app.use(express.json());

app.use('/api/partners', partnersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/customer_addresses', customerAddressesRouter);
app.use('/api/products', productCatalogsRouter);
app.use('/api/products/description', productDescRouter);

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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}...`));
