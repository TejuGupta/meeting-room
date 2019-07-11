require('dotenv').config();
var commandRouter = require('./routes/command');
var action = require('./routes/action');

const { createServer } = require('http');
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const PORT = 8000;

app.use('/slack/actions', action.expressMiddleware());
app.use(bodyParser.urlencoded({extended: true}))
app.use("/slack/commands", commandRouter);

app.listen(process.env.PORT || PORT, () => {
  console.log(`server running on port ${PORT}`);
});

