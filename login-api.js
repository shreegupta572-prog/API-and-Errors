const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Demo user database (for testing)
const userDB = {
  email: "user@example.com",
  password: "$2b$10$8wR0k4oRz9uYkz5Vq3GJrOZk2xwD1l7C4g6u8E3x0n9q1X0o3Q5z2" // hashed password
};

// Rate limiting storage (for learning purpose)
const ipAttempts = {};
const emailAttempts = {};

app.post("/login", async (req, res) => {

  const { email, password, captcha } = req.body;
  const ip = req.ip;

  // -------------------------
  // 1️⃣ IP RATE LIMIT
  // -------------------------
  if (!ipAttempts[ip]) {
    ipAttempts[ip] = 0;
  }

  ipAttempts[ip]++;

  if (ipAttempts[ip] > 5) {
    return res.status(429).json({
      message: "Too many requests from this IP"
    });
  }

  // -------------------------
  // 2️⃣ CAPTCHA CHECK
  // -------------------------
  if (captcha !== "1234") {
    return res.status(400).json({
      message: "Invalid captcha"
    });
  }

  // -------------------------
  // 3️⃣ ACCOUNT ATTEMPT LIMIT
  // -------------------------
  if (!emailAttempts[email]) {
    emailAttempts[email] = 0;
  }

  emailAttempts[email]++;

  if (emailAttempts[email] > 5) {
    return res.status(429).json({
      message: "Account temporarily locked"
    });
  }

  // -------------------------
  // 4️⃣ EMAIL CHECK
  // -------------------------
  if (email !== userDB.email) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  // -------------------------
  // 5️⃣ PASSWORD CHECK
  // -------------------------
  const match = await bcrypt.compare(password, userDB.password);

  if (!match) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  // -------------------------
  // 6️⃣ GENERATE JWT
  // -------------------------
  const token = jwt.sign(
    { email: userDB.email },
    "secret_key",
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token: token
  });

});

// Start server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
