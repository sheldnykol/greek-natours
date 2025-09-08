const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews =
// catchAsync(async (req, res, next) => {
//   let filter = {}; //an bgaleis to filter
//   if (req.params.tourId) filter = { tour: req.params.tourId }; // aytes tis duo grammes ousiaastika ta deixnei ola ta apotelesmata
//   //enw me liga logia edw leei an exei kapoio tourid tote emfanise mono apo auta tis kritikes !
//   const reviews = await Review.find(filter);
//   //send response
//   res.status(200).json({
//     status: 'succsess',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//   //Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId; //ta bazoume se dika tous synarhtsh gt dne einai sto factory
//   if (!req.body.user) req.body.user = req.user.id; //

//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.setToursUserIds = (req, res, next) => {
  //allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId; //ta bazoume se dika tous synarhtsh gt dne einai sto factory
  if (!req.body.user) req.body.user = req.user.id; //
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
//blepeis oti mporoyme na ta kanoyme ola factory alla an eoyme kapoio kwdika poy den ton exei to factory module
//tote ti kanoyme ? ta bazw ta dyo merh tou kwdika se allh sunarthsh middlewere KAI TO BAZW
//NA TREXEI STO ROUTER ! PRIN TREXW TO CREATE ONE APO TO FACTORY .PHGAINE STO ROUTER APO TO REVIEW PRIN TO CREATE
