const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//model with fields name,email,photo , password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true, //tha kanoume use npm package validator gia email
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: { type: String, default: 'default.jpg' },
  //tha einai to path ths photo to string opoy tha einai mesa sta files
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false, //den tha emfanizete otan to kanw get
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date, //10 min to expire
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  //hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12); //kanw ton password encrypted kanw await kai perimenei na kanei encrypted

  //delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
//tseakrei an o kwdikos poy dwthke einai o idios poy mphke sthn bash
//instace mtheod ! θα εινα ιδιαθεσιμη

userSchema.pre(/^find/, function (next) {
  //string wich start with find (query middlewere)deixnei sto current muddlewere (getallusers find...)
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  canditatePassword,
  userPassword,
) {
  // den einai diathesimos this.password
  return await bcrypt.compare(canditatePassword, userPassword); //epistrefei true h false // kalw authn thn function sto usercontroller
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    //console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // dhladh an ekdothke to jwt sto 100 kai allaxe o kwdikos sto 200 to 100 < 200 ara allaxe o kwdikos
    //false not changed true changed
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //token poy tha steiloyme ston user opoy o user tha tyo kanei use gia naa kanei neo password

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log('resetToken : ', resetToken);
  //console.log('this.passwordResetToken : ', this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
