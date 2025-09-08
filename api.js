//import files
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
// const helmet = require('helmet');
//const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const app = express();
const viewRouter = require('./routes/viewRoutes');

app.set('view engine', 'pug'); // ths express alla //npm i pug
app.set('views', path.join(__dirname, '/views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

//example den xreaizetai na mplekomaste me // briskei to path! eukola apo thn node.js
//app.use(express.static(`${__dirname}/public`));
//app.use(express.static(path.join(__dirname, 'public')));
// 1 MIDDLEWARES
//============================================================
//Set Security HTTP headers
// app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(
    morgan('dev', {
      skip: (req, res) => {
        // Παράλειψη logs για static files
        return req.url.match(/\.(css|js|jpg|png|gif|ico)$/);
      },
    }),
  );
}

// //katanohsh to morgan dev tha kalesei mia function typoy
// {  (req, res, next) => {
//   console.log('Hello from the middlewere !! ');
//   next(); () }
const limiter = rateLimit({
  max: 100, //100 request orio thn wra
  windowMs: 60 * 60 * 1000, //60 min 60 sec 1000 mil sec (1 hour)
  message: 'Too many requests from this IP , please try again later', //prostateuei an enas hacker kanei polla request gia ton password kapoioy(brute force)
}); //object of options
app.use('/api', limiter);

//Body parser , reading data from body unto req.body
app.use(express.json({ limit: '10kb' })); //ναι middlerewere όπου αναλυεί το json body των αιτημάτω
//και το κάνει διαθέσιμο στο req.body

app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//dATA SANITIZATION AGAIN NoSQL query
//app.use(mongoSanitize()); //(hack login postman) seinai middlewere oopoy koitaei to request body to query string params kai filtrarei ektos ola ta $ kai . ! gia asfaleian
//Data Sanitization against XSS
// app.use(xss());
app.use(express.static(`${__dirname}/public`));
///Σερβίρει στατικά αρχεία (π.χ. εικόνες, CSS) από τον φάκελο public.

//Test middllewere
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  //console.log(req.headers); //stelnei mazi me thn aithsh toy user-agent ... host ,connection , postman-token..
  next();
});
//custom middlewere : Αυτό το middleware προσθέτει το requestTime στο req και εκτυπώνει τα headers του αιτήματος.

// app.use((req, res, next) => {
//   console.log('Hello from the middlewere !! ');
//   console.log(`${res}`);
//   next();
// });

// //kanei apply se kathe request opote tha emfanizei to mynhma se lathe klhsh
// //epeidh den kaname specify kapoio route (app/tours...ex )

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

//sthn express sto req request se ena root den exei to body me ta data
//poy pernei opote xrhsimopoioyme to middleware
//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
// (3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//paizei rolo poy einai ekei sthn thesh tou kwdika dioti
//trexei gia ola ta erwthmata opote pernaei prwta apo to app.use tour router..
//afou einai okay den pernaei apo auto enw an htan panw apo ayto tha ekteloytan panta
//auto  > operational error
app.all('*', (req, res, next) => {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: `cant find ${req.originalUrl} on this server!`,
  //   });
  //   const err = new Error(`cant find ${req.originalUrl} on this server!`);
  //   err.status = 'fail';
  //   err.statusCode = 404;
  //   next(err);
  next(new AppError(`cant find ${req.originalUrl} on this server!`, 404));
}); //tha trexei gia all ta hhtps request , * everything

//creating error  middleware function  to katalbainei h express oti einai ayto
app.use(globalErrorHandler);
//Η εντολή app.use(globalErrorHandler) λέει στο Express
// //να χρησιμοποιήσει το middleware που ορίζεται στο
// // errorController.js για τη διαχείριση όλων των σφαλμάτων που προκύπτουν στην εφαρμογή.

//===================================================================
module.exports = app;

// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello from server side!', app: 'Natours' });
// });
// //GET ALL TOURS
// app.get('/api/v1/tours', getAllTours);

// //GET TOUR FROM ID
// app.get('/api/v1/tours/:id', getTour);

// //POST CREATE TOUR
// app.post('/api/v1/tours', createTour);

// //UPDATE TOUR
// app.patch('/api/v1/tours/:id', updateTour);

// //DELETE TOUR
// app.delete('/api/v1/tours/:id', deleteTour);
