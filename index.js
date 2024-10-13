const express = require("express");
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Create an instance of the express app
const app = express();

// Define your AuthAction-specific settings using environment variables
const authActionDomain = process.env.AUTHACTION_DOMAIN;
const audience = process.env.AUTHACTION_AUDIENCE;
const issuer = `https://${authActionDomain}/`;

// JWT middleware for authenticating requests
const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint
  secret: jwksRsa.expressJwtSecret({
    cache: true, // Cache the signing key to improve performance
    rateLimit: true, // Limits the rate of key retrievals to prevent DoS attacks
    jwksRequestsPerMinute: 5, // Rate limit for JWKS endpoint requests
    jwksUri: `${issuer}.well-known/jwks.json`, // AuthAction's JWKS endpoint
  }),

  // Validate the audience and the issuer
  audience: audience,
  issuer: issuer,
  algorithms: ["RS256"], // RS256 is the algorithm typically used for JWTs signed with RSA keys
});

// Define your API routes
app.get("/protected", checkJwt, (req, res) => {
  res.send({ message: "You have accessed a protected route!" });
});

app.get("/public", (req, res) => {
  res.send({ message: "This is a public route, no authentication needed." });
});

// Handle errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).send({ message: "Invalid token" });
  }
  next(err);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
