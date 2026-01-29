const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const path = require('path');
const axios = require('axios'); // Μην ξεχάσεις: npm install axios

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `George Kolonas <${process.env.EMAIL_FROM}>`;
  }

  // Αυτό θα δουλεύει ΜΟΝΟ για το Mailtrap (Development)
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    try {
      // 1) Render HTML από το Pug template
      const html = pug.renderFile(
        path.join(__dirname, '..', 'views', 'email', `${template}.pug`),
        {
          firstName: this.firstName,
          url: this.url,
          subject,
        }
      );

      // 2) ΕΛΕΓΧΟΣ: Production (API) ή Development (Mailtrap)
      if (process.env.NODE_ENV?.trim() === 'production') {
        console.log('--- SENDING VIA BREVO API (HTTPS) ---');

        // Αποστολή μέσω HTTP POST - Παρακάμπτει τα μπλοκαρισμένα SMTP ports
        await axios({
          method: 'POST',
          url: 'https://api.brevo.com/v3/smtp/email',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY, // Εδώ το xkeysib-... API KEY
            'content-type': 'application/json',
          },
          data: {
            sender: { name: 'George Kolonas', email: process.env.EMAIL_FROM },
            to: [{ email: this.to }],
            subject: subject,
            htmlContent: html,
          },
        });

        console.log(`🚀 API Success: Email sent to ${this.to}`);
      } else {
        // ΤΟΠΙΚΑ (Development) - Χρήση Nodemailer/Mailtrap
        const mailOptions = {
          from: this.from,
          to: this.to,
          subject,
          html,
          text: convert(html),
        };

        await this.newTransport().sendMail(mailOptions);
        console.log('✅ Mailtrap Success: Email sent');
      }
    } catch (err) {
      // Αν το API επιστρέψει σφάλμα (π.χ. άκυρο κλειδί), θα το δούμε εδώ
      const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
      console.error('❌ EMAIL ERROR:', errorMsg);
      throw err;
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Greek Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)'
    );
  }
};