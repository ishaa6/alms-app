const { getPool } = require('../config/db');

// Fetch user profile
const getUserProfile = async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id; // assuming JWT payload contains user id
    const user = await pool.query('SELECT id, name, email, designation, phone_number, address, department FROM users WHERE id = $1', [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { designation, phone_number, address, department } = req.body;

    await pool.query(
      'UPDATE users SET designation = $1, phone_number = $2, address = $3, department = $4 WHERE id = $5',
      [designation, phone_number, address, department, userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserProfile, updateUserProfile };
