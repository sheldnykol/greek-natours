const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'a120aa001@smtp-brevo.com',
    pass: process.env.BREVO_API_KEY
  },
  authMethod: 'LOGIN' 
});
console.log('Δοκιμή σύνδεσης με κλειδί:', process.env.BREVO_API_KEY);

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ ΑΠΟΤΥΧΙΑ::', error.message);
  } else {
    console.log('✅ ΕΠΙΤΥΧΙΑ: Η Brevo δέχτηκε τα στοιχεία σου!!!');
  }
});