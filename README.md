# Integrating Authorization in ExpressJS API using AuthAction

This is an ExpressJS application demonstrating how to integrate API authorization using [AuthAction](https://authaction.com/) with the `jwks-rsa` and `express-jwt` libraries.

## Overview

This application demonstrates how to configure and handle authorization using AuthAction’s access token in an ExpressJS API. It uses JSON Web Tokens (JWT) for authentication and authorization by verifying tokens via a JSON Web Key Set (JWKS) from AuthAction.

## Prerequisites

Before using this application, ensure you have:

1. **Node.js and npm installed**: You can download and install them from [nodejs.org](https://nodejs.org/).
2. **AuthAction API credentials**: You will need the `tenantDomain` and `apiIdentifier` from your AuthAction account.

## Installation

1. **Clone the repository** (if applicable):

   ```bash
   git clone git@github.com:authaction/authaction-expressjs-api-example.git
   cd authaction-expressjs-api-example
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure your Authaction credentials**:

   Edit the `.env` and replace the placeholders with your AuthAction configurations.

   ```bash
   AUTHACTION_DOMAIN=your-authaction-tenant-domain
   AUTHACTION_AUDIENCE=your-authaction-api-identifier
   ```

## Usage

1. **Start the development server**:

   ```bash
   npm start
   ```

   This will start the application on `http://localhost:3000`.

2. **Testing Authorization**:

To obtain an access token via client credentials, run the following curl command:

```bash
 curl --request POST \
--url https://your-authaction-tenant-domain/oauth/m2m/token \
--header 'content-type: application/json' \
--data '{"client_id":"your-authaction-app-clientid","client_secret":"your-authaction-app-client-secret","audience":"your-authaction-api-identifier","grant_type":"client_credentials"}'
```

Replace your-authaction-app-clientid, your-authaction-app-client-secret, and your-authaction-api-identifier with your actual AuthAction credentials.

You should receive an access token in response, which you can use to access protected routes.

You can call the public API without access token. The `GET /public` endpoint can be accessed by any user or service but protected endpoint need to be called with access token.

```bash
curl --request GET \
  --url http://localhost:3000/protected \
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  --header 'content-type: application/json'
```

```json
{
  "message": "You have accessed a protected route!"
}
```

## Code Explanation

### JWT Authentication (`checkJwt` middleware)

The application uses the `jwks-rsa` and `express-jwt` libraries to handle JWT authentication. The JWT middleware validates the tokens issued by AuthAction and ensures that only valid tokens can access protected routes.

#### `jwksRsa.expressJwtSecret`:

- Dynamically provides the signing key based on the `kid` (key ID) in the JWT header.
- Caches the key to improve performance and limits the number of requests to the JWKS endpoint.

#### JWT Middleware Configuration:

- **secret**: Provided dynamically using `jwksRsa.expressJwtSecret`.
- **issuer**: Ensures the JWT is issued by the AuthAction domain.
- **audience**: Ensures the JWT is intended for the API, matching the `audience` configured in AuthAction.
- **algorithms**: Enforces the use of the `RS256` algorithm.

### Public and Protected Routes

- **Public Route (`/public`)**:
  - This route can be accessed by anyone without authentication.
  - No JWT validation is required for this route.
- **Protected Route (`/protected`)**:
  - This route requires a valid JWT in the `Authorization` header (`Bearer <token>`).
  - The token is validated using the `checkJwt` middleware.

### Error Handling

The middleware includes error handling for JWT-related issues:

- **UnauthorizedError**: When an invalid or missing token is provided, a 401 error is returned with the message "Invalid token".

### Environment Variables

The application uses environment variables to configure the AuthAction domain and audience. Ensure these are set correctly in the `.env` file:

- **AUTHACTION_DOMAIN**: The domain of your AuthAction tenant (e.g., `https://tenant.region.authaction.com`).
- **AUTHACTION_AUDIENCE**: The API identifier configured in AuthAction.

---

### Common Issues

#### **Invalid Token Errors**:

- Ensure that the token being used is signed by AuthAction using the `RS256` algorithm and contains the correct issuer and audience claims.
- Verify that the `AUTHACTION_DOMAIN` and `AUTHACTION_AUDIENCE` environment variables are correctly set.

#### **Public Key Fetching Errors**:

- Ensure the application can access the JWKS endpoint (`/.well-known/jwks.json`) from AuthAction.
- Check the configuration of jwksRsa and ensure the JWKS URI is correct.

#### **Unauthorized Access**:

- If requests to the protected route (`/protected`) are failing, ensure that the JWT token is being correctly included in the `Authorization` header and that the token is valid.

---

### Contributing

Feel free to submit issues or pull requests if you encounter bugs or have suggestions for improvement!
