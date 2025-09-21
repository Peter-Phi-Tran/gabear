// server.js
const express = require("express");
const cors = require("cors");
const supabase = require("../supaBaseClient")

require("dotenv").config();

//initialize app
const app = express();
app.use(cors());
app.use(express.json());

//---------------- Health check---------------------
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});
//-----------------------------------------------


//--------------Signup route------------------
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

//---------------------------------------------
  // Optional: create user profile row after signup
  await supabase.from("profiles").insert([{ id: data.user.id, email }]);

  res.status(201).json({ message: "User signed up successfully", user: data.user });
});

//------------------------ Login route------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ message: "Login successful", session: data.session, user: data.user });
});
//-------------------------------------------------------

// Example: fetch profile
app.get("/profile/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend at http://localhost:${PORT}`);
});
