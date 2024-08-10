const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Use routes defined in the routes module
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
