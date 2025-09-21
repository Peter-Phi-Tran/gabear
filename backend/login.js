require("dotenv").config();

const express = require("express");
const cors = require("cors");
const supabase = require("../supaBaseClient");

const app = express();
const PORT = 3000;

// middleware
app.use(cors());
app.use(express.json());

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login request body:", req.body);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: "Login successful!",
      user: data.user,
      session: data.session, // contains access + refresh tokens
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Server error logging in" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
