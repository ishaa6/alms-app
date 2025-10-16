const nodeMailer = require('nodemailer');
const {fetchSecrets} = require('../vault/vault-client');

let transporter;

async function initMailer() {
  const secrets = await fetchSecrets();

  transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
      user: secrets.EMAIL_USER,
      pass: secrets.EMAIL_PASSWORD
    }
  });

  console.log("✅ Mail transporter initialized");
}

function getTransporter() {
  if (!transporter) throw new Error("Transporter not initialized");
  return transporter;
}

module.exports = { initMailer, getTransporter };
