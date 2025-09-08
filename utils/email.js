const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const sendgridTransport = require('@sendgrid/mail');
// const dotenv = require('dotenv');
// dotenv.config({ path: './config.env' });

//new Email(user, url).sendWelcome();
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
      // SendGrid
      if (
        !process.env.SENDGRID_API_KEY ||
        !process.env.SENDGRID_API_KEY.startsWith('SG.')
      ) {
        throw new Error(
          'Invalid or missing SendGrid API Key. It must start with "SG."',
        );
      }
      sendgridTransport.setApiKey(process.env.SENDGRID_API_KEY);
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey', // Η λέξη "apikey" είναι κυριολεκτική
          pass: process.env.SENDGRID_API_KEY,
        },
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
    //production send real emails
    //not productions mail trap apllication !
  }
  async send(template, subject) {
    //send actual email
    //1) Render HTML based on a pug template
    //PWS DOULEUEI  res.render(''); // h ennoia tou render function : create to html based on the pug template kai to stlene ston clienti
    //edw DEN THELOYME NA KANOYME RENDER THELOYME NA FTIACOUME HTML APO TO TEMPLATE WSTE NA STEILOYME TO HTML WS EMAIL

    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
      isProduction: this.isProduction,
    });
    //2) Define email options
    //
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html), //html-to-text
    };

    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the GreekTours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min)',
    );
  }
};

// const sendEmail = async (options) => {
//   // 1) Δημιουργία transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });
//   // console.log('userNAME: ', process.env.EMAIL_USERNAME);

//   // 2) Καθορισμός επιλογών email
//   // const mailOptions = {
//   //   from: 'George Kolonas <hello@george.to>',
//   //   to: options.email,
//   //   subject: options.subject,
//   //   text: options.message,
//   // };

//   // 3) Αποστολή του email
//   await transporter.sendMail(mailOptions);
// };
