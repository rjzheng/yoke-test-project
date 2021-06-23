// External
require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 8000;
const apis = require('./routes/api');

// middlewares
app.use(express.json());

// routes
app.use('/api', apis);

app.listen(port, () => {
  console.log(`App started at ${port}`);
});
