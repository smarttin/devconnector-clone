const express = require("express");
const mongoose = require("mongoose");
const app = express();

const db = require("./config/database");

mongoose
  .connect(db.mongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongodb Connected");
  })
  .catch(err => {
    console.log(err);
  });

app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server running on port ${port}`));
