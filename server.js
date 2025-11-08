const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const herokuRoutes = require("./routes/heroku");
app.use("/heroku", herokuRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Deploy site running on ${PORT}`));
