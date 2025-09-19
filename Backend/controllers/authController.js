const User = require("../models/user");

exports.signup = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });
  try {
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }
    await User.create({ username, password });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.login = (sessions) => async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password)
      return res.status(401).json({ error: "Invalid credentials" });
    const token = Math.random().toString(36).substring(2);
    sessions[token] = username;
    // Set token as HTTP-only cookie
    res.cookie("token", token, { httpOnly: true });
    res.json({ success: true, token });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
};

// Logout endpoint factory
exports.logout = (sessions) => (req, res) => {
  const token = req.cookies.token;
  if (token && sessions[token]) {
    delete sessions[token];
  }
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};
