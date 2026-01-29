const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const path = require('path');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `George Kolonas <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // Χρησιμοποιούμε .trim() γιατί στο Render καμιά φορά μπαίνουν κενά στα Env Variables
    if (process.env.NODE_ENV?.trim() === 'production') {
      // Brevo (Production)
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 465, // Χρησιμοποιούμε 465 (SSL) που είναι πιο σταθερό στο Render
        secure: true, 
        auth: {
          user: 'a120aa001@smtp-brevo.com', // Το Login ID της Brevo
          pass: process.env.BREVO_API_KEY,  // Το SMTP Key από το Dashboard
        }
      });
    }

    // Mailtrap (Development)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Στέλνει το πραγματικό email
  async send(template, subject) {
    try {
      // 1) Ορισμός του σωστού path για το template (πιο ασφαλές για Render)
      const html = pug.renderFile(
        path.join(__dirname, '..', 'views', 'email', `${template}.pug`), 
        {
          firstName: this.firstName,
          url: this.url,
          subject
        }
      );

      // 2) Email Options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: subject,
        html: html,
        text: convert(html)
      };

      // 3) Δημιουργία transport και αποστολή
      const transport = this.newTransport();
      await transport.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully to: ${this.to}`);

    } catch (err) {
      // Εδώ θα δεις το ΠΡΑΓΜΑΤΙΚΟ λάθος στα Logs του Render
      console.error('❌ ERROR IN EMAIL CLASS:', err.message);
      console.error('Full Error details:', err);
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