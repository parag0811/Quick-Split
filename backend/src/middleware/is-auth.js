const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    const error = new Error("Token not found.");
    error.statusCode = 401;
    return next(error);
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decodedToken.userId };
    next();
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production' ? true : false,
      sameSite: "None",
      path: "/",
    });
    return res.status(401).json({ message: "Invalid token" });
  }
};
