const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// =======================
// Register new user
// =======================
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body; // allow role if needed

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "citizen",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// Login user
// =======================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =======================
// Admin: Get all users
// =======================
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Not authorized" });
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================
// Admin: Update user
// =======================
const updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================
// Admin: Toggle user active status
// =======================
const toggleUserStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Not authorized" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  updateUser,
  toggleUserStatus,
};
