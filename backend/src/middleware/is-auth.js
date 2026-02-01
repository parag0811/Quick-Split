import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Not Authenticated.");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decodedToken.userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default isAuth;
