const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `George Kolonas <${process.env.EMAIL_FROM}>`;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  newTransport() {
    if (this.isProduction) {
      return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // TLS, όχι SSL
        auth: {
          user: 'a120aa001@smtp-brevo.com', // Πρέπει να είναι ΤΟ ΙΔΙΟ με το email του Brevo account σου
          pass: process.env.BREVO_API_KEY ,  // Το SMTP Password/API Key
        },
        authMethod: 'PLAIN' // Πρόσθεσε αυτή τη γραμμή αν συνεχίζει το 535 error
      });
    }

    // Mailtrap για development
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
      // 1) Render HTML
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject,
        isProduction: this.isProduction,
      });

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText.convert(html),
      };

      // 3) Create a transport and send email
      const transport = this.newTransport();
      await transport.sendMail(mailOptions);
      //console.log(`Email sent successfully to ${this.to}`);
      
    } catch (err) {
      //console.log('--- ERROR SENDING EMAIL ---');
      //console.log(err); 
      // Ρίχνουμε ξανά το σφάλμα για να το πιάσει ο Controller αν χρειάζεται
      throw err; 
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Greek Natours Family | ');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)',
    );
  }
};