# Login API Documentation

## Overview
This is a Node.js Express.js login API implementation that demonstrates secure authentication practices including rate limiting, CAPTCHA verification, password hashing, and JWT token generation.

## File Structure
```
├── login-api.js          # Main API implementation
├── README.md            # This documentation file
└── package.json         # Dependencies (not included)
```

## Dependencies
Install the required packages:
```bash
npm install express bcrypt jsonwebtoken
```

## API Endpoint

### POST /login
Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword",
  "captcha": "1234"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Invalid CAPTCHA
- `401` - Invalid email or password
- `429` - Too many requests (IP or account locked)

## Security Features Explained

### 1️⃣ IP Rate Limiting
```javascript
const ipAttempts = {};

if (!ipAttempts[ip]) {
  ipAttempts[ip] = 0;
}
ipAttempts[ip]++;

if (ipAttempts[ip] > 5) {
  return res.status(429).json({
    message: "Too many requests from this IP"
  });
}
```
**Purpose:** Prevents brute force attacks from the same IP address
**Limit:** 5 attempts per IP
**Storage:** In-memory (resets on server restart)

### 2️⃣ CAPTCHA Verification
```javascript
if (captcha !== "1234") {
  return res.status(400).json({
    message: "Invalid captcha"
  });
}
```
**Purpose:** Prevents automated attacks/bots
**Implementation:** Simple hardcoded check ("1234")
**Production Note:** Should use real CAPTCHA service like Google reCAPTCHA

### 3️⃣ Account Attempt Limiting
```javascript
const emailAttempts = {};

if (!emailAttempts[email]) {
  emailAttempts[email] = 0;
}
emailAttempts[email]++;

if (emailAttempts[email] > 5) {
  return res.status(429).json({
    message: "Account temporarily locked"
  });
}
```
**Purpose:** Prevents account-specific brute force attacks
**Limit:** 5 attempts per email
**Storage:** In-memory (resets on server restart)

### 4️⃣ Secure Password Comparison
```javascript
const match = await bcrypt.compare(password, userDB.password);
```
**Purpose:** Securely compare user input with stored hashed password
**Method:** Uses bcrypt's timing-safe comparison
**Security:** Prevents timing attacks and rainbow table attacks

### 5️⃣ JWT Token Generation
```javascript
const token = jwt.sign(
  { email: userDB.email },
  "secret_key",
  { expiresIn: "1h" }
);
```
**Purpose:** Creates authentication token for session management
**Payload:** User email
**Secret:** "secret_key" (should be environment variable in production)
**Expiry:** 1 hour

## Demo User Database
```javascript
const userDB = {
  email: "user@example.com",
  password: "$2b$10$8wR0k4oRz9uYkz5Vq3GJrOZk2xwD1l7C4g6u8E3x0n9q1X0o3Q5z2"
};
```
**Email:** user@example.com
**Password:** Hashed version of "password" (for testing)
**Note:** This is a demo - use real database in production

## Authentication Flow
1. Client sends login request with credentials
2. Server validates IP rate limit
3. Server verifies CAPTCHA
4. Server checks account attempt limit
5. Server validates email exists
6. Server compares password using bcrypt
7. If all validations pass, server generates JWT token
8. Server returns success response with token

## Security Best Practices Demonstrated
- ✅ Password hashing with bcrypt
- ✅ Rate limiting (IP and account-based)
- ✅ CAPTCHA verification
- ✅ JWT token authentication
- ✅ Consistent error messages (don't reveal which field is wrong)
- ✅ Token expiration

## Production Improvements Needed
- 🔄 Use environment variables for secrets
- 🔄 Implement persistent storage (Redis/Database)
- 🔄 Use real CAPTCHA service
- 🔄 Add password reset functionality
- 🔄 Implement proper logging
- 🔄 Add input validation
- 🔄 Use HTTPS only
- 🔄 Implement token refresh mechanism
- 🔄 Add account lockout duration
- 🔄 Use proper database instead of in-memory storage

## Testing the API

### Start the Server
```bash
node login-api.js
```
Server will run on http://localhost:3000

### Test with curl
```bash
# Successful login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","captcha":"1234"}'

# Invalid password
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrong","captcha":"1234"}'

# Invalid captcha
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","captcha":"wrong"}'
```

## Common Attack Vectors Prevented
- **Brute Force Attacks:** Rate limiting and account lockout
- **Automated Bots:** CAPTCHA verification
- **Password Exposure:** Hashing with bcrypt
- **Session Hijacking:** JWT tokens with expiration
- **Information Disclosure:** Generic error messages

## Learning Points
This code demonstrates:
- How to implement secure authentication
- Importance of multiple security layers
- Proper password handling with bcrypt
- JWT token usage for stateless authentication
- Rate limiting strategies
- Defense in depth security approach

## HTTP Status Codes Reference

### 1xx Informational Responses
- **100 Continue** - Server received request headers and should continue to send request body
- **101 Switching Protocols** - Client asked to switch protocols and server has agreed
- **102 Processing** - Server has received and is processing the request (WebDAV)
- **103 Early Hints** - Server returned some response headers before final HTTP message

### 2xx Success Responses
- **200 OK** - Request succeeded (most common success response)
- **201 Created** - Request succeeded and new resource was created
- **202 Accepted** - Request accepted for processing, but processing not completed
- **203 Non-Authoritative Information** - Request succeeded but returned modified information
- **204 No Content** - Request succeeded but no content to return
- **205 Reset Content** - Request succeeded, reset content view
- **206 Partial Content** - Server is delivering only part of the resource (byte serving)

### 3xx Redirection Messages
- **300 Multiple Choices** - Request has multiple possible responses
- **301 Moved Permanently** - URL of requested resource has been changed permanently
- **302 Found** - URL of requested resource has been changed temporarily
- **303 See Other** - Response to another URL using GET method
- **304 Not Modified** - Resource has not been modified since last request
- **305 Use Proxy** - Can only be accessed through proxy
- **306 (Unused)** - No longer used
- **307 Temporary Redirect** - Request should be repeated with another URI
- **308 Permanent Redirect** - Request and all future requests should be repeated using another URI

### 4xx Client Error Responses
- **400 Bad Request** - Server cannot process request due to client error (malformed syntax)
- **401 Unauthorized** - Client must authenticate itself to get requested response
- **402 Payment Required** - Reserved for future use (originally for digital payment systems)
- **403 Forbidden** - Client does not have access rights to the content
- **404 Not Found** - Server cannot find requested resource
- **405 Method Not Allowed** - Request method known by server but not supported by target resource
- **406 Not Acceptable** - Response cannot satisfy the criteria in request headers
- **407 Proxy Authentication Required** - Client must authenticate with proxy
- **408 Request Timeout** - Server timed out waiting for the request
- **409 Conflict** - Request conflicts with current state of server
- **410 Gone** - Resource requested is no longer available and will not be available again
- **411 Length Required** - Content-Length header field is required
- **412 Precondition Failed** - One or more preconditions in request header fields failed
- **413 Payload Too Large** - Request entity larger than limits defined by server
- **414 URI Too Long** - URI provided was too long for server to process
- **415 Unsupported Media Type** - Request media format not supported by server
- **416 Range Not Satisfiable** - Cannot satisfy range request header
- **417 Expectation Failed** - Expectation indicated by Expect request header cannot be met
- **418 I'm a teapot** - April Fools' joke code (RFC 2324)
- **421 Misdirected Request** - Request was directed at server that cannot produce response
- **422 Unprocessable Entity** - Server understands request but cannot process contained instructions
- **423 Locked** - Resource being accessed is locked
- **424 Failed Dependency** - Request failed due to failure of previous request
- **425 Too Early** - Server refuses to process request that might be replayed
- **426 Upgrade Required** - Server refuses to perform request using current protocol
- **428 Precondition Required** - Origin server requires request to be conditional
- **429 Too Many Requests** - User has sent too many requests in given amount of time
- **431 Request Header Fields Too Large** - Request header fields too large
- **451 Unavailable For Legal Reasons** - Server denies access due to legal reasons

### 5xx Server Error Responses
- **500 Internal Server Error** - Generic server error when no specific message is suitable
- **501 Not Implemented** - Server does not support request method
- **502 Bad Gateway** - Server acting as gateway received invalid response from upstream server
- **503 Service Unavailable** - Server not ready to handle request (overloaded or down for maintenance)
- **504 Gateway Timeout** - Server acting as gateway did not receive timely response from upstream server
- **505 HTTP Version Not Supported** - HTTP version used in request is not supported
- **506 Variant Also Negotiates** - Server has internal configuration error
- **507 Insufficient Storage** - Server unable to store representation needed to complete request
- **508 Loop Detected** - Server detected infinite loop while processing request
- **510 Not Extended** - Further extensions to request are required for server to fulfill it
- **511 Network Authentication Required** - Client needs authentication to gain network access

## Status Codes Used in This API

### Successfully Implemented
- **200 OK** - Login successful, token returned
- **400 Bad Request** - Invalid CAPTCHA provided
- **401 Unauthorized** - Invalid email or password
- **429 Too Many Requests** - IP rate limit exceeded or account locked

### Common REST API Best Practices
- **200 OK** - GET, PUT, PATCH successful operations
- **201 Created** - POST successful resource creation
- **204 No Content** - DELETE successful operations
- **400 Bad Request** - Validation errors, malformed JSON
- **401 Unauthorized** - Authentication required/failed
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource does not exist
- **405 Method Not Allowed** - HTTP method not supported for endpoint
- **409 Conflict** - Resource conflict (duplicate creation)
- **422 Unprocessable Entity** - Validation errors with proper formatting
- **429 Too Many Requests** - Rate limiting exceeded
- **500 Internal Server Error** - Unexpected server errors

## Next Steps for Learning
1. Implement a real database integration
2. Add user registration endpoint
3. Implement password reset functionality
4. Add middleware for JWT verification
5. Implement proper logging and monitoring
6. Add input validation and sanitization
