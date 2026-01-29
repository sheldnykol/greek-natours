// const { promisify } = require('util');
// // const util = require('util'); //pernei kateutheian to promisify?
// const User = require('./../models/userModel');
// const catchAsync = require('./../utils/catchAsync');
// const jwt = require('jsonwebtoken');
// const AppError = require('./../utils/appError');
// const sendEmail = require('./../utils/email');
// const crypto = require('crypto');

// //TOKEN
// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };

// const createSendToken = (user, statusCode, res) => {
//   const token = signToken(user._id);
//   const cookieOptions = {
//     //cookie

//     expires: new Date(
//       Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
//     ),
//     secure: false, //tha stalthei encrypted
//     httpOnly: true, //den mporei na ginei modified apo browser to cookie//recive the cookie kai to stlenei automata me rqueste
//   };
//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; //mono otan einai production
//   res.cookie('jwt', token, cookieOptions);
//   //remove the password from output
//   user.password = undefined;
//   //
//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     data: {
//       user,
//     },
//   });
// };
// //SIGN UP
// exports.signup = catchAsync(async (req, res, next) => {
//   const newUser = await User.create(req.body); //epistrefei ena promsie
//   createSendToken(newUser, 201, res);
//   // const token = jwt.sign({ id: newUser._id}, process.env.JWT_SECRET, {
//   //     expiresIn: process.env.JWT_EXPIRES_IN});

//   // res.status(201).json({
//   //   status: 'success',
//   //   token,
//   //   data: {
//   //     user: newUser,
//   //   },
//   // });
// });
// //ekdidoume ena json web token se periptwsh poy user exists kai o kwdikos einai correct!
// //ftiaxnw json web token kai to stelnw pisw ston xrhsth

// //LOGIN
// exports.login = catchAsync(async (req, res, next) => {
//   //const email = req.body.email; //
//   const { email, password } = req.body; //dyo variables apo to req.body
//   //1 check if email and passwords exist
//   if (!email || !password) {
//     return next(new AppError('please provide email and password', 400));
//     //bazw return dioti afou kalesw to epomeno middlewere teleiwnw thn sundehsh ekei apo to login
//   }
//   //2 check if user exists && and passwords is correct
//   const user = await User.findOne({ email }).select('+password'); //expume to mdoel to select poy to kanei kryfo to password //edw an gra4w select + password to kanw na einai kai auto sto user

//   //pws tha kanw sugkrish ton kwdiko ?
//   //to vazw ekei wste an den yparxei o user na mhn trexei kan to || ...
//   if (!user || !(await user.correctPassword(password, user.password))) {
//     //PETAXE SFALMA AN DEN YPARXEI O XRHSTHS H O KWDIKOS EINAI LATHOS
//     return next(new AppError('Incorrect email or password', 401)); //401 => unauthorized
//   }
//   // console.log('user:', user);
//   //3 if all ok steile to token ston client

//   createSendToken(user, 200, res);
// });

// exports.protect = catchAsync(async (req, res, next) => {
//   //1) getting token and check if its here
//   //bazw sto headers sto postMan : Authorization Bearer kkfgdkg και μου το εμφανιζει στην console απο το console log στο api console.log(req.headers)
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }
//   //console.log(token);

//   if (!token) {
//     return next(
//       new AppError('You are not logged in !Please log in to get access.', 401),
//     );
//   }
//   //2) validate token (check the signature  of jwt is valid or not )
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //einai mia klhsh sunarthshs opoy epistrefei mia promise
//   //einai to decoded payload apo to jwt (await dioti einai async function)
//   //console.log(decoded); //to id poy bgazei einai to object id poy tha deis apo ton user sthn mongo db(user id)
//   //3) check if user still exists
//   const freshUser = await User.findById(decoded.id);
//   if (!freshUser) {
//     return next(
//       new AppError(
//         'The user belonging to this token does no longer exist.! ',
//         401,
//       ),
//     );
//   }
//   //4) check if user changed password after the JWT token was issued
//   if (freshUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('user recently cahnged password! Please log in again', 401),
//     );
//   }
//   //am ola pane kala tote tha ginei next() gia natrexei to getalltours px
//   req.user = freshUser;
//   next(); //shmainei OTI MAS PAEI STO MIDDLEWERE OPOY EPISTREFEI AUTA POY THELOYNE
// });

// //middlewres for restrict routes

// //einai sundedemenos o xrhsths ?gia render pages
// exports.isLoggedIn = async (req, res, next) => {
//   //1) getting token and check if its here
//   //bazw sto headers sto postMan : Authorization Bearer kkfgdkg και μου το εμφανιζει στην console απο το console log στο api console.log(req.headers)
//   if (req.cookies.jwt) {
//     try {
//       // 1) verify token
//       const decoded = await promisify(jwt.verify)(
//         req.cookies.jwt,
//         process.env.JWT_SECRET,
//       );

//       // 2) Check if user still exists
//       const currentUser = await User.findById(decoded.id);
//       if (!currentUser) {
//         return next();
//       }

//       // 3) Check if user changed password after the token was issued
//       if (currentUser.changedPasswordAfter(decoded.iat)) {
//         return next();
//       }

//       // THERE IS A LOGGED IN USER
//       res.locals.user = currentUser;
//       return next();
//     } catch (err) {
//       return next();
//     }
//   }
//   next();
// };

// //middlewres for restrict routes

// exports.restrictTo = (...roles) => {
//   //PERIORISMOS DIAGRAFHS TOUR MONO GIA ADMIN KAI LEAD-GUIDE
//   return (req, res, next) => {
//     // roles ['admin', 'lead-guide'].role='user
//     if (!roles.includes(req.user.role)) {
//       //pernei to req ueser apo to prohgoyemno middlewere to protected perase sto next dhladh
//       return next(
//         //tseakrei an o rolos to user eina include sto ...roles ! dhladh an pas sto delete route ...roles =  admin , lead-guide
//         new AppError('You dont have permission to permorm this action', 403),
//       );
//     }
//     next();
//   };
// };

// exports.forgotPassword = async (req, res, next) => {
//   // 1) Get user baded on Posted email
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     return next(
//       new AppError('There is no user with this email address.!', 404),
//     );
//   }
//   // 2) Generate the random reset token
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   // 3) Send it to users email
//   const resetURL = `${req.protocol}://${req.get(
//     'host',
//   )}/api/v1/users/resetPassword/${resetToken}`;
//   const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didnt forget your password , please ignore this email! `;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: 'Your password reset token (valid for 10 min)',
//       message,
//     });

//     res.status(200).json({
//       status: 'success',
//       message: 'Token sent to email',
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(
//       new AppError(
//         'There was an error sending the email , Try again later',
//         500,
//       ),
//     );
//   }
// };
// exports.resetPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on the token
//   const hashedToken = crypto
//     .createHash('sha256')
//     .update(req.params.token)
//     .digest('hex');
//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   // 2) If token has not expired, and there is user, set the new password
//   if (!user) {
//     return next(new AppError('Token is invalid or has expired', 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;
//   await user.save(); // des ligo giati kanoyme use save kai oxi updatefindbyid mpla mpla

//   // 3) Update changedPasswordAt property for the user
//   // 4) Log the user in, send JWT
//   createSendToken(user, 200, res);
// });

// //ALLAXE TON PASSWORD APO LOGIN USER
// exports.updatePassword = catchAsync(async (req, res, next) => {
//   //zhtame trexon password prin ginei updae gia logous asfaleias
//   // 1) GEt user from collection mongo d
//   //thumisou kanw findbyId giati authn h leitorugia einai mondo gia logged user ara exw to id apo to token
//   const user = await User.findById(req.user.id).select('+password');

//   // 2) check if the POST password is correct
//   if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
//     return next(new AppError('Your current password is wrong.', 401));
//   }
//   //3 ) if the password is correct update the password
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   await user.save();
//   // User.find
//   // 4) log the user in  , sent the JWT to the user
//   createSendToken(user, 200, res);
// });

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  const url = `${req.protocol}://${req.get('host')}/me`;
  try{
    await new Email(newUser, url).sendWelcome();
  } catch (err) {
    console.log('Email failed to send , but user was created successfully.!');
    console.log(err);
  }
  
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  //console.log(req.cookies); // Εμφανίζει τα cookies του request
  //console.log(res.get('Set-Cookie')); // Εμφανίζει τα cookies που στέλνονται στην απόκριση
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
    token = req.cookies.jwt;
  }

  if (!token) {
    if (req.originalUrl.startsWith('/api')) {
      return next(
        new AppError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      );
    }
    return res.redirect('/login'); // Ανακατεύθυνση για μη API requests
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    //console.log('roles', ...roles);

    // Check if req.user exists and has a role property
    if (!req.user || !req.user.role) {
      //console.log('Cannot read user role');
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    //console.log('role', req.user.role);

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log('--- FORGOT PASSWORD START ---');
  console.log('Email requested:', req.body.email);

  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    console.log('❌ User not found with this email');
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  console.log('✅ Reset token generated and saved to DB');

  // 3) Set reset URL
  const baseURL = `${req.protocol}://${req.get('host')}`;
  const resetURL = process.env.NODE_ENV?.trim() === 'production'
      ? `${baseURL}/resetPassword/${resetToken}`
      : `${baseURL}/api/v1/users/resetPassword/${resetToken}`;

  console.log('Reset URL created:', resetURL);

  try {
    console.log('Attempting to send email via Brevo...');
    await new Email(user, resetURL).sendPasswordReset();
    console.log('🚀 EMAIL SENT SUCCESSFULLY');

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.error('❌ EMAIL SENDING FAILED:', err.message);
    
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  //console.log('req.params', req.params);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
