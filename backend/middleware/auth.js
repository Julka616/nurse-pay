const jwt = require("jsonwebtoken");


const auth = (req, res, next) => {

  try {

    const authorization = req.headers.authorization;


    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        message: "Brak tokenu. Zaloguj się ponownie."
      });

    }


    const token = authorization.split(" ")[1];


    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    req.user = decoded;


    next();

  } catch (error) {

    return res.status(401).json({
      message: "Token jest nieprawidłowy lub wygasł."
    });

  }

};


module.exports = auth;