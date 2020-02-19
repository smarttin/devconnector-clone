const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  // console.log(authHeader);
  if (!authHeader) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  // console.log(token);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "someSuperSecretKey");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  // console.log(decodedToken);
  // req.user = {
  //   id: decodedToken.id,
  //   name: decodedToken.name,
  //   email: decodedToken.email
  // }
  req.userId = decodedToken.id;
  next();
};
