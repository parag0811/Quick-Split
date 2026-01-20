import { validationResult } from "express-validator";

const expressValidation = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation Failed. Please enter fields correctly.",
    );
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }
  next();
};

export default expressValidation;
