if (process.env.NODE_ENV === "production") {
  module.exports = {mongoURI: "mongodb://smartt:smartt07@ds135680.mlab.com:35680/devconnect"}
} else {
  module.exports = {mongoURI: "mongodb://localhost/devconnect"}
}
