const { getPool }  = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verificationCodes = new Map();
const {getTransporter} = require('../config/mail');
const {fetchSecrets} = require('../vault/vault-client');

exports.signup = async (req, res) => {
  const { name, email, password, role = 'employee' } = req.body; 
  const pool = getPool(); 
  
  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashed, role]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
};


exports.login = async (req, res) => {
  const pool = getPool(); 
  const { email } = req.body;
  console.log("login : " + email);
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  const secrets = await fetchSecrets();

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id },
    secrets.JWT_SECRET,
    { expiresIn: '1d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, company_id: user.company_id } });
};

exports.getMe = async (req, res) => {
  const pool = getPool(); 
  res.json({ user: req.user });
};

exports.checkEmailExists = async(req, res) => {
  const pool = getPool(); 
  const hashed = await bcrypt.hash('password', 10);
  console.log(hashed)
  const {mail} = req.body;
  console.log("Check for mail id ", mail);
  try{
    const result = await pool.query(
      'select id from users where email = $1', [mail]
    );
    if(result.rows.length>0){
      return res.json({exists: true})
    } else{
      return res.json({exists: false})
    }
  } catch(err){
    console.log("Error getting mail");
    res.status(500).json({error: "Internal server error"});
  }
};

exports.sendVerificationCode = async(req, res) => {
  const pool = getPool(); 
  const transporter = getTransporter();
  const {email} = req.body;
  let code;
  let expiry;
  const existing = verificationCodes.get(email);

  if (existing && existing.expiresAt > Date.now()) {
    code = existing.code;
    expiry = existing.expiresAt;
  } else {
    code = Math.floor(1000 + Math.random() * 9000).toString();
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 2 * 60 * 1000,
    });
    expiry = verificationCodes.get(email).expiresAt;
  }

  try{
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verification Code',
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2 style="color: #333;">Your Verification Code</h2>
                  <p style="font-size: 16px; color: #555;">Use the code below to reset your account password:</p>
                  <p style="font-size: 32px; font-weight: bold; color: #000; margin-top: 10px;">${code}</p>
                  <p style="font-size: 14px; color: #888;">This code is valid for 2 minutes.</p>
                </div>
              `
    });
    console.log(`Verification code for ${email}: ${code}`);
    res.json({ message: 'Verification code sent', expiresAt: expiry });
  }catch(err){
    console.log("Error sending mail ", err);
    res.status(500).json({error: 'Failed to send verification code'});
  }
}

exports.verifyCode = async (req, res) => {
  const pool = getPool(); 
  const transporter = getTransporter();
  const { email, code } = req.body;
  const entry = verificationCodes.get(email);

  console.log("Input: ", email, code);

  if (!entry) {
    return res.status(400).json({ error: 'No verification code found. Please request a new one.' });
  }

  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
  }

  if (entry.code !== code) {
    return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
  }

  verificationCodes.delete(email);
  res.json({ message: 'Code verified' });
};

exports.setNewPassword = async(req, res) =>{
  const pool = getPool(); 
  const transporter = getTransporter();
  const {email, password} = req.body;
  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('UPDATE users set password=$1 WHERE email = $2',
      [hashedPassword, email]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Password reset successful' });    
  } catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

