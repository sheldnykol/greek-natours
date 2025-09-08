const AppError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  //console.log('Message in handleCasrErrorDb');
  return new AppError(message, 400); //400 =  bad request

  // /CastError: Π.χ. λανθασμένο ID στο /api/v1/tours/fdffreg.
  // //Το middleware το πιάνει και το επεξεργάζεται με το handleCastErrorDB.
};
const handleDublicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  //console.log('err ermsg ==== > ', value);
  const message = `Dublicate Field Value: ${value} Please use another value!`; //twra apo to err tha parw to errmsg suge=kekrimena to name of tour
  //google search regular epressjon match text bettween ' '
  return new AppError(message, 400);
  // APP ERROR GIA EMFANISH STO PRODUCTION

  //Duplicate Error (κωδικός 11000): Π.χ. προσπάθεια δημιουργίας χρήστη με υπάρχον email.
  //  Χειρίζεται από το handleDublicateFieldsDB.
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data.${errors.join('. ')}`; //twra prepei na paroume ola ta error poy dhmiourgoyntai poy einai mesa sto error poy emfaniete otan exoume developemnet sto postman
  return new AppError(message, 400);
  //Validation Error
  //Παράδειγμα: Αν λείπει ένα υποχρεωτικό πεδίο ή η τιμή είναι εκτός ορίων, το μήνυμα μπορεί να είναι: Invalid Input Data. Name is required. Price must be a number..
};
//ΑΠΟΣΤΟΛΗ ΣΦΑΛΜΑΤΩΝ !
//development
const handleJWTError = () =>
  new AppError('Invalid token. Please Log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      name: err.name,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
    // RENDER TEMPLATE
  } else {
    res
      .status(err.statusCode)
      .render('error', { title: 'Something went Wrong', msg: err.message });
  }
}; //ME LIGA LOGIA AN EINAI APO /API PX STELNEIS APO POSTAMAN TOTE STELENEI AYTA ME JSON ENW DIAFORETIKA KANEI RENDER
// KANEI RENDER ENA TEMPLATE ! named ' error ' με tittle something went wrong kai to msg poy to kanw use sto error.pug

//production
//Λειτουργία:
//Αν το σφάλμα είναι isOperational (λειτουργικό, π.χ. από AppError), στέλνει μόνο το status και το message.
//Διαφορετικά (μη λειτουργικό σφάλμα, π.χ. σφάλμα κώδικα), καταγράφει το σφάλμα στην κονσόλα και στέλνει γενικό μήνυμα:
// //Something went wrong με κωδικό 500 (Internal Server Error).
//xρήση: Εξασφαλίζει ότι οι χρήστες δεν βλέπουν τεχνικές λεπτομέρειες, ενώ οι προγραμματιστές μπορούν να δουν το πλήρες σφάλμα στην κονσόλα.
const sendErrorProd = (err, req, res) => {
  // Έλεγχος αν το request είναι για API
  if (req && req.originalUrl && req.originalUrl.startsWith('/api')) {
    // Λειτουργικό σφάλμα για API
    if (err.isOperational) {
      return res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message,
      });
    }
    // Προγραμματιστικό σφάλμα για API
    //console.error('ERROR', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }

  // Λειτουργικό σφάλμα για non-API (render Pug template)
  if (err.isOperational) {
    return res.status(err.statusCode || 500).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // Προγραμματιστικό σφάλμα για non-API (render Pug template)
  //console.error('ERROR', err);
  return res.status(500).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  //console.log('NODE_ENV:', process.env.NODE_ENV);
  err.statusCode = err.statusCode || 500; //500 error  404 fail
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    //console.log(err);

    //let error = { ...err }; // kati san copy toy err
    //console.log('error name : ', error.name);
    if (error.name === 'CastError') error = handleCastErrorDB(error); //tha perasoume to error mesa se authn to function
    if (error.code === 11000) error = handleDublicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error); //validation error name
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    //kai tha epistre4di new error apo APPeror class
    //didiakasia
    //kanoyme kati san copy to err sto error το στλενουμε στο handleCastErrorDB(err)
    //απο εκει κανουμε το message οπου το στελνουμε σην κλαση AppError

    sendErrorProd(error, req, res);

    // } else {
    //   sendErrorDev(err, res);
  }
};
//3 errors bazw kati lathos sto url get  ...tours/fdffreg
