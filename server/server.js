const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors")
const app = express();

const db = require("./config/keys");

// connect to mongoDB
mongoose
  .connect(db.mongoURI, { useNewUrlParser: true })
  .then(() => {
    console.log("Mongodb Connected");
  })
  .catch(err => {
    console.log(err);
  });
  
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(cors());

app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data});
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server running on port ${port}`));
